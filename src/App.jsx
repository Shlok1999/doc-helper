import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, Download } from 'lucide-react';

function App() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    const newFiles = selectedFiles.map((file) => {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

      return {
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        outputFilename: nameWithoutExt,
        width: 800, // Default width
        height: 600, // Default height
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== id);
      const removedFile = prev.find((f) => f.id === id);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updatedFiles;
    });
  };

  const updateFileSettings = (id, updates) => {
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, ...updates } : file)));
  };

  const processAndDownloadImage = async (fileState) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = fileState.width;
        canvas.height = fileState.height;
        ctx.drawImage(img, 0, 0, fileState.width, fileState.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const extension = fileState.file.name.split('.').pop() || 'png';
            const filename = `${fileState.outputFilename}.${extension}`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          }
        }, fileState.file.type);
      };
      img.src = fileState.preview;
    });
  };

  const handleProcessAndDownload = async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      for (const file of files) {
        await processAndDownloadImage(file);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <ImageIcon className="w-8 h-8" />
            Image Processor
          </h1>

          <div className="mb-8">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Only image files</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                multiple
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-6">
              {files.map((fileState) => (
                <div key={fileState.id} className="bg-gray-50 rounded-lg p-4 relative">
                  <button
                    onClick={() => removeFile(fileState.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {fileState.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {(fileState.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Output filename
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fileState.outputFilename}
                          onChange={(e) =>
                            updateFileSettings(fileState.id, { outputFilename: e.target.value })
                          }
                          placeholder="Enter output filename"
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-500">
                          .{fileState.file.name.split('.').pop()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          value={fileState.width}
                          onChange={(e) =>
                            updateFileSettings(fileState.id, { width: Number(e.target.value) })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          value={fileState.height}
                          onChange={(e) =>
                            updateFileSettings(fileState.id, { height: Number(e.target.value) })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={fileState.preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleProcessAndDownload}
                disabled={processing || files.length === 0}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Process & Download
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default App;
