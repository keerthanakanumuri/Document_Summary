// UploadArea.jsx
// Handles file selection via click or drag-and-drop.
// Accepts PDF, PNG, JPG, JPEG files only.

import { useRef, useState } from 'react';

// Files we allow the user to upload
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

function UploadArea({ file, onFileSelect, onFileRemove, error }) {
  // isDragging tracks whether the user is hovering a file over the drop zone
  const [isDragging, setIsDragging] = useState(false);

  // This ref lets us trigger the hidden file input when the user clicks the box
  const fileInputRef = useRef(null);

  // Called when the user picks a file via the file dialog
  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) {
      onFileSelect(selected);
    }
  }

  // Called when the user drags a file over the drop zone
  function handleDragOver(e) {
    e.preventDefault(); // needed to allow dropping
    setIsDragging(true);
  }

  // Called when the user's cursor leaves the drop zone
  function handleDragLeave() {
    setIsDragging(false);
  }

  // Called when the user drops a file onto the drop zone
  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      onFileSelect(dropped);
    }
  }

  // Format the file size to show KB or MB
  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Check if the file type is allowed
  function isValidType(f) {
    return ALLOWED_TYPES.includes(f.type) ||
      ALLOWED_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext));
  }

  return (
    <div className="w-full">
      {/* Drop zone box */}
      <div
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : file
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        {/* Hidden file input — triggered by clicking the box above */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          /* Show selected file info */
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl">
              {file.type === 'application/pdf' ? '📄' : '🖼️'}
            </div>
            <p className="font-semibold text-gray-800 text-sm break-all px-4">
              {file.name}
            </p>
            <p className="text-gray-500 text-xs">
              {formatFileSize(file.size)}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              isValidType(file)
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {file.type === 'application/pdf' ? 'PDF Document' : 'Image File'}
            </span>
          </div>
        ) : (
          /* Show upload instructions */
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl">📂</div>
            <div>
              <p className="text-gray-700 font-semibold text-base">
                Drag & drop your file here
              </p>
              <p className="text-gray-400 text-sm mt-1">or</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // prevent double-trigger
                fileInputRef.current.click();
              }}
            >
              Choose File
            </button>
            <p className="text-gray-400 text-xs">
              Supports PDF, PNG, JPG, JPEG
            </p>
          </div>
        )}
      </div>

      {/* Remove file button — only shown when a file is selected */}
      {file && (
        <button
          type="button"
          onClick={onFileRemove}
          className="mt-2 text-sm text-red-500 hover:text-red-700 underline transition-colors"
        >
          ✕ Remove file
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

export default UploadArea;
