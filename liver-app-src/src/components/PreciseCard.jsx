import OfficeRow from "./OfficeRow";

export default function PreciseCard({ name, status, statusClass, body, offices = [], children }) {
  return (
    <article className="result-card result-card--precise">
      <span className={`result-card__status ${statusClass}`}>{status}</span>
      <h3 className="result-card__name">{name}</h3>
      <p className="result-card__summary" dangerouslySetInnerHTML={{ __html: body }} />
      {children}
      {offices.length > 0 && (
        <div className="result-card__offices">
          {offices.map((o, i) => <OfficeRow key={i} office={o} />)}
        </div>
      )}
    </article>
  );
}
