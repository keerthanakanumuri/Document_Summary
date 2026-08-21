// SummaryLengthSelector.jsx
// Shows three radio button options: Short, Medium, Long.
// The selected value is passed up to App.jsx via onChange.

// Each option has a label, description, and value
const OPTIONS = [
  {
    value: 'short',
    label: 'Short',
    description: '3–5 sentences',
    icon: '⚡',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: '1–2 paragraphs',
    icon: '📝',
  },
  {
    value: 'long',
    label: 'Long',
    description: 'Detailed summary',
    icon: '📖',
  },
];

function SummaryLengthSelector({ selected, onChange }) {
  return (
    <div className="w-full">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Summary Length
      </p>

      {/* Three clickable cards — one per option */}
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.value;

          return (
            <label
              key={option.value}
              className={`
                flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer
                transition-all duration-150
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
            >
              {/* Hidden radio input — the label itself acts as the clickable area */}
              <input
                type="radio"
                name="summaryLength"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="hidden"
              />
              <span className="text-xl">{option.icon}</span>
              <span className="font-semibold text-sm">{option.label}</span>
              <span className="text-xs text-center opacity-75">
                {option.description}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default SummaryLengthSelector;
