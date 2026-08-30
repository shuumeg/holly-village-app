export default function SelectField({ label, options, value, onChange, defaultLabel = "未確認" }) {
  return (
    <label className="clinical-field">
      <span className="clinical-field__label">{label}</span>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">{defaultLabel}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
