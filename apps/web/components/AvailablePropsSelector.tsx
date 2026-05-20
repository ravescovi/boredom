const props = [
  { value: "paper", emoji: "📄", label: "Paper" },
  { value: "pens", emoji: "✏️", label: "Pens" },
  { value: "timer", emoji: "⏱️", label: "Timer" },
  { value: "cards", emoji: "🃏", label: "Cards" },
  { value: "dice", emoji: "🎲", label: "Dice" },
  { value: "whiteboard", emoji: "🖍️", label: "Whiteboard" },
  { value: "sticky notes", emoji: "📝", label: "Sticky notes" }
];

type Props = {
  defaultProps?: string[];
};

export function AvailablePropsSelector({ defaultProps }: Props = {}) {
  const selected = defaultProps && defaultProps.length > 0 ? new Set(defaultProps) : new Set(["paper", "pens"]);
  return (
    <fieldset className="grid gap-2">
      <legend className="text-[12px] font-bold uppercase tracking-[.03em]">Available props</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
        {props.map((prop) => (
          <label
            key={prop.value}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border-2 border-ink bg-white px-1.5 py-2.5 text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm has-[:checked]:bg-butter has-[:checked]:shadow-brut-sm"
          >
            <input
              name="props"
              type="checkbox"
              value={prop.value}
              defaultChecked={selected.has(prop.value)}
              className="sr-only"
            />
            <span className="text-[22px] leading-none" aria-hidden="true">
              {prop.emoji}
            </span>
            <span>{prop.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
