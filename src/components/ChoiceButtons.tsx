interface ChoiceButtonsProps {
  choices: string[];
  onSelect: (text: string) => void;
  disabled: boolean;
}

function ChoiceButtons({ choices, onSelect, disabled }: ChoiceButtonsProps) {
  if (choices.length === 0) return null;

  return (
    <div className="bg-[#f5ebe0] px-3 pt-2">
      <div className="flex flex-wrap gap-2 max-w-2xl mx-auto">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => onSelect(choice)}
            disabled={disabled}
            className="px-4 py-2 rounded-full bg-white border border-[#d9a89a] text-sm text-[#7a5c4e] hover:bg-[#fbeee8] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChoiceButtons;
