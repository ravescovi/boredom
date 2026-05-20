const circumstances = [
  {
    emoji: "🛋️",
    label: "Chill hangout",
    value: "Friends relaxing indoors with paper, pens, and a 20-minute window."
  },
  {
    emoji: "🍕",
    label: "Party table",
    value: "A cheerful group gathered around a table with snacks, phones away, paper, and pens."
  },
  {
    emoji: "🚗",
    label: "Waiting around",
    value: "People waiting together with limited space, low energy, and a need for quick laughs."
  },
  {
    emoji: "☕",
    label: "Cozy chat",
    value: "A relaxed conversation setting with comfortable seats and simple materials."
  }
];

type Props = {
  defaultValue?: string;
};

export function CircumstancesInput({ defaultValue }: Props = {}) {
  const matchedIndex = circumstances.findIndex((c) => c.value === defaultValue);
  const selectedIndex = matchedIndex >= 0 ? matchedIndex : 0;
  return (
    <fieldset className="grid gap-2">
      <legend className="text-[12px] font-bold uppercase tracking-[.03em]">The vibe</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {circumstances.map((item, index) => (
          <label
            key={item.label}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border-2 border-ink bg-white px-1.5 py-2.5 text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm has-[:checked]:bg-butter has-[:checked]:shadow-brut-sm"
          >
            <input
              name="circumstances"
              type="radio"
              value={item.value}
              defaultChecked={index === selectedIndex}
              className="sr-only"
            />
            <span className="text-[22px] leading-none" aria-hidden="true">
              {item.emoji}
            </span>
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
