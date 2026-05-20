const props = ["Paper", "Pens", "Timer", "Cards", "Dice", "Whiteboard", "Sticky notes"];

export function AvailablePropsSelector() {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-lg font-semibold text-[#251646]">Available props</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {props.map((prop) => (
          <label key={prop} className="flex items-center gap-2 text-[#4d3f66]">
            <input name="props" type="checkbox" value={prop.toLowerCase()} />
            <span>{prop}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
