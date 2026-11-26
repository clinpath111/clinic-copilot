export function ChoiceChips({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col">
      <legend className="text-base font-medium text-ink">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="flex h-12 min-w-24 cursor-pointer items-center justify-center rounded-control border border-line-strong bg-surface px-4 text-base font-medium text-ink-soft transition-colors hover:border-ink-faint peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary-ink peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
