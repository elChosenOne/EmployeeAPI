interface ToggleSwitchProps {
  leftLabel: string
  rightLabel: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ToggleSwitch({ leftLabel, rightLabel, checked, onChange }: ToggleSwitchProps) {
  return (
    <div role="radiogroup" className="inline-flex rounded-full border border-slate-300 bg-slate-100 p-0.5 text-xs font-medium">
      <button
        type="button"
        role="radio"
        aria-checked={!checked}
        onClick={() => onChange(false)}
        className={`rounded-full px-3 py-1 transition-colors ${
          !checked ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        onClick={() => onChange(true)}
        className={`rounded-full px-3 py-1 transition-colors ${
          checked ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {rightLabel}
      </button>
    </div>
  )
}
