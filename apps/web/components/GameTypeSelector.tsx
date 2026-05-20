const gameTypes = ["Creative", "Conversation", "Puzzle", "Collaborative", "Party-light"];

type Props = {
  defaultValue?: string;
};

export function GameTypeSelector({ defaultValue = "creative" }: Props = {}) {
  return (
    <div className="grid gap-2">
      <label htmlFor="gameType" className="text-[12px] font-bold uppercase tracking-[.03em]">
        Game style
      </label>
      <select
        id="gameType"
        name="gameType"
        defaultValue={defaultValue}
        className="w-full appearance-none rounded-[10px] border-[3px] border-ink bg-white px-3.5 py-3 pr-9 text-sm font-semibold shadow-brut-sm"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231A1A1A' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center"
        }}
      >
        {gameTypes.map((type) => (
          <option key={type} value={type.toLowerCase()}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
