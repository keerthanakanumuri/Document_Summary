// ResultDisplay.jsx
// Shows the AI-generated summary and key points after processing.
// Also has a "Summarize Another Document" button to reset the app.

function ResultDisplay({ summary, keyPoints, onReset }) {
  return (
    <div className="w-full space-y-6">
      {/* Success banner */}
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <span className="text-xl">✅</span>
        <span className="font-medium text-sm">Summary generated successfully!</span>
      </div>

      {/* Summary section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>📄</span> Summary
        </h2>
        {/* Split the summary into paragraphs for readable formatting */}
        <div className="space-y-2">
          {summary.split('\n').filter(p => p.trim()).map((paragraph, index) => (
            <p key={index} className="text-gray-700 text-sm leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Key points section — only show if we have key points */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>💡</span> Key Points
          </h2>
          <ul className="space-y-2">
            {keyPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                {/* Numbered bullet */}
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reset button — lets the user start over with a new document */}
      <button
        onClick={onReset}
        className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
      >
        📂 Summarize Another Document
      </button>
    </div>
  );
}

export default ResultDisplay;
