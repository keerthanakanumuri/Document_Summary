// App.jsx — Main application component
// This is the "brain" of the frontend.
// It holds all the state and connects all the components together.

import { useState } from 'react';
import UploadArea from './components/UploadArea';
import SummaryLengthSelector from './components/SummaryLengthSelector';
import LoadingSpinner from './components/LoadingSpinner';
import ResultDisplay from './components/ResultDisplay';

// The backend URL — in production this will be your Render deployment URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// The loading messages shown in sequence during processing
const LOADING_MESSAGES = [
  'Uploading document...',
  'Extracting text...',
  'Generating summary...',
  'Almost done...',
];

function App() {
  // The file the user has selected
  const [file, setFile] = useState(null);

  // The chosen summary length: 'short', 'medium', or 'long'
  const [summaryLength, setSummaryLength] = useState('medium');

  // Whether we are currently waiting for the backend to respond
  const [isLoading, setIsLoading] = useState(false);

  // The current loading message to show to the user
  const [loadingMessage, setLoadingMessage] = useState('');

  // The result from the backend: { summary, keyPoints }
  const [result, setResult] = useState(null);

  // Any error message to show to the user
  const [error, setError] = useState('');

  // File validation error (shown inside the upload box)
  const [fileError, setFileError] = useState('');

  // Called when the user selects or drops a file
  function handleFileSelect(selectedFile) {
    setError('');
    setFileError('');
    setResult(null);

    // Validate file type
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    const allowedExt = ['.pdf', '.png', '.jpg', '.jpeg'];
    const isValid =
      allowed.includes(selectedFile.type) ||
      allowedExt.some(ext => selectedFile.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      setFileError('Please upload a PDF, PNG, JPG or JPEG file.');
      return;
    }

    // Limit file size to 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File is too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
  }

  // Called when the user removes the selected file
  function handleFileRemove() {
    setFile(null);
    setFileError('');
    setError('');
    setResult(null);
  }

  // Cycles through loading messages to keep the user informed
  function startLoadingMessages() {
    let index = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);

    const interval = setInterval(() => {
      index++;
      if (index < LOADING_MESSAGES.length) {
        setLoadingMessage(LOADING_MESSAGES[index]);
      } else {
        clearInterval(interval);
      }
    }, 2500); // change message every 2.5 seconds

    return interval;
  }

  // Called when the user clicks "Generate Summary"
  async function handleSubmit() {
    // Make sure a file is selected
    if (!file) {
      setError('Please select a document first.');
      return;
    }

    setError('');
    setResult(null);
    setIsLoading(true);

    // Start cycling loading messages
    const messageInterval = startLoadingMessages();

    try {
      // Build a FormData object to send the file to the backend
      const formData = new FormData();
      formData.append('document', file);
      formData.append('summaryLength', summaryLength);

      // Send the request to our backend API
      const response = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST',
        body: formData,
        // Note: do NOT set Content-Type header — the browser sets it automatically
        // with the correct multipart boundary when using FormData
      });

      const data = await response.json();

      // If the server returned an error, show it
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // Store the result so ResultDisplay can show it
      setResult(data);

    } catch (err) {
      // Show a friendly error — never expose internal details
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to the server. Make sure the backend is running.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      // Always stop loading, regardless of success or error
      clearInterval(messageInterval);
      setIsLoading(false);
      setLoadingMessage('');
    }
  }

  // Resets everything so the user can start fresh
  function handleReset() {
    setFile(null);
    setResult(null);
    setError('');
    setFileError('');
    setSummaryLength('medium');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-5 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            📋 Document Summary Assistant
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload a document and get an AI-powered summary in seconds.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">

          {/* If we have a result, show the result view */}
          {result ? (
            <ResultDisplay
              summary={result.summary}
              keyPoints={result.keyPoints}
              onReset={handleReset}
            />
          ) : isLoading ? (
            /* While loading, show the spinner */
            <LoadingSpinner message={loadingMessage} />
          ) : (
            /* Default view: upload + options + button */
            <>
              {/* Upload area */}
              <UploadArea
                file={file}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                error={fileError}
              />

              {/* Summary length selector */}
              <SummaryLengthSelector
                selected={summaryLength}
                onChange={setSummaryLength}
              />

              {/* General error message (not file-specific) */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || !file}
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-200
                  ${file && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                ✨ Generate Summary
              </button>

              {/* Small hint under the button */}
              {!file && (
                <p className="text-center text-gray-400 text-xs">
                  Select a file above to enable this button
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Powered by Google Gemini · Supports PDF & Images
        </p>
      </main>
    </div>
  );
}

export default App;
