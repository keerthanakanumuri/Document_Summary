// LoadingSpinner.jsx
// Shows a spinner animation and a status message while the backend is working.
// The message prop changes depending on what stage we're at.

function LoadingSpinner({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      {/* CSS spinner — no extra libraries needed */}
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

      {/* Status message passed in from App.jsx */}
      <p className="text-gray-600 font-medium text-sm text-center">
        {message || 'Processing...'}
      </p>

      {/* Subtle hint so the user knows it might take a moment */}
      <p className="text-gray-400 text-xs text-center">
        This may take a few seconds
      </p>
    </div>
  );
}

export default LoadingSpinner;
