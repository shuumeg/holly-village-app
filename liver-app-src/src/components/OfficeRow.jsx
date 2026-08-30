export default function OfficeRow({ office }) {
  return (
    <p className="result-card__office">
      <span className="result-card__icon" aria-hidden="true">🏢</span>
      {office.label ? <strong>{office.label}：</strong> : null}
      {office.name}
      {office.phone ? (
        <>
          {" "}
          <a href={`tel:${office.phone.replace(/-/g, "")}`}>{office.phone}</a>
        </>
      ) : null}
      {office.note ? (
        <>
          <br />
          <span className="result-card__office-note">{office.note}</span>
        </>
      ) : null}
    </p>
  );
}
