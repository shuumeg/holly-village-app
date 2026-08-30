export default function CheckboxGroup({ options, value, onChange }) {
  const toggle = (id) => {
    const set = new Set(value);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange(Array.from(set));
  };

  return (
    <div className="option-list">
      {options.map((opt) => {
        const checked = value.includes(opt.id);
        return (
          <label key={opt.id} className={`option${checked ? " option--selected" : ""}`}>
            <input type="checkbox" checked={checked} onChange={() => toggle(opt.id)} />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
