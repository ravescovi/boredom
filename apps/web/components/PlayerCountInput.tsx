type Props = {
  defaultMin?: string;
  defaultMax?: string;
};

export function PlayerCountInput({ defaultMin = "2", defaultMax = "6" }: Props = {}) {
  return (
    <div className="grid gap-2">
      <div className="text-[12px] font-bold uppercase tracking-[.03em]">How many of you</div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <input
          aria-label="Minimum players"
          name="minPlayers"
          type="number"
          min={1}
          defaultValue={defaultMin}
          className="w-full rounded-[10px] border-[3px] border-ink bg-white p-3 text-center font-display text-2xl font-extrabold shadow-brut-sm"
        />
        <span className="text-xl font-extrabold text-ink/30">→</span>
        <input
          aria-label="Maximum players"
          name="maxPlayers"
          type="number"
          min={1}
          defaultValue={defaultMax}
          className="w-full rounded-[10px] border-[3px] border-ink bg-white p-3 text-center font-display text-2xl font-extrabold shadow-brut-sm"
        />
      </div>
    </div>
  );
}
