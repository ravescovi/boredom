export function CircumstancesInput() {
  const options = [
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

  return (
    <fieldset className="grid gap-3">
      <legend className="text-lg font-semibold text-[#251646]">Circumstances</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option, index) => (
          <label
            key={option.label}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-[#ffd166] bg-white px-3 py-3 text-[#251646]"
          >
            <input
              name="circumstances"
              type="radio"
              value={option.value}
              defaultChecked={index === 0}
            />
            <span className="text-2xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span className="font-medium">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
