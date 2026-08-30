export default function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="option-list">
      {options.map((opt) => {
        const checked = value === opt.id;
        return (
          <label key={opt.id} className={`option${checked ? " option--selected" : ""}`}>
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(opt.id)}
            />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
