const constraints = [
  "No drinking or intoxication mechanics.",
  "No gambling, betting, wagering, lotteries, or financial stakes.",
  "No physical-risk mechanics, unsafe movement, pain, restraint, weapons, or dangerous dares.",
  "No imitation of existing games, franchises, or protected IP.",
  "Generated games cannot be commercialized."
];

export function SafetyConstraintsNotice() {
  return (
    <aside className="h-fit rounded-md border-2 border-[#ffd166] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#251646]">Safety constraints</h2>
      <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#4d3f66]">
        {constraints.map((constraint) => (
          <li key={constraint}>{constraint}</li>
        ))}
      </ul>
    </aside>
  );
}
