export default function NumberField({ label, unit, step = "1", value, onChange }) {
  return (
    <label className="clinical-field">
      <span className="clinical-field__label">{label}{unit ? `（${unit}）` : ""}</span>
      <input
        type="number"
        step={step}
        inputMode="decimal"
        value={value}
        placeholder="未入力"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
