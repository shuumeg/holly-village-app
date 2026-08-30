export default function CheckFieldset({ title, items, values, onToggle }) {
  return (
    <fieldset className="clinical-group">
      <legend>{title}</legend>
      <div className="clinical-checks">
        {items.map((it) => (
          <label key={it.key} className="clinical-check">
            <input
              type="checkbox"
              checked={!!values[it.key]}
              onChange={(e) => onToggle(it.key, e.target.checked)}
            />
            <span>{it.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
