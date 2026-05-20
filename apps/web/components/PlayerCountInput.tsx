export function PlayerCountInput() {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-lg font-semibold text-[#251646]">Number of players</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[#4d3f66]">Minimum</span>
          <input
            name="minPlayers"
            type="number"
            min={1}
            defaultValue={2}
            className="rounded-md border border-[#ffd166] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[#4d3f66]">Maximum</span>
          <input
            name="maxPlayers"
            type="number"
            min={1}
            defaultValue={6}
            className="rounded-md border border-[#ffd166] bg-white px-3 py-2"
          />
        </label>
      </div>
    </fieldset>
  );
}
