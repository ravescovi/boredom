const gameTypes = ["Creative", "Conversation", "Puzzle", "Collaborative", "Party-light"];

export function GameTypeSelector() {
  return (
    <label className="grid gap-2">
      <span className="text-lg font-semibold text-[#251646]">Game type</span>
      <select name="gameType" className="rounded-md border border-[#ffd166] bg-white px-3 py-2">
        {gameTypes.map((type) => (
          <option key={type} value={type.toLowerCase()}>
            {type}
          </option>
        ))}
      </select>
    </label>
  );
}
