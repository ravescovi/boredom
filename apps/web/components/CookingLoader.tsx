export function CookingLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center"
    >
      <span className="text-5xl" aria-hidden="true">
        🍳
      </span>
      <p className="text-xl font-bold text-[#251646]">Cooking up your game…</p>
      <p className="text-sm text-[#4d3f66]">
        Usually takes about ten seconds. Hang tight.
      </p>
    </div>
  );
}
