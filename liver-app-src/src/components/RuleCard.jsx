import OfficeRow from "./OfficeRow";

export default function RuleCard({ rule, answers }) {
  const offices = rule.offices(answers);
  const extra = rule.extraNote ? rule.extraNote(answers) : null;

  return (
    <article className="result-card">
      <span className="result-card__badge">{rule.category}</span>
      <h3 className="result-card__name">{rule.name}</h3>
      <p className="result-card__reason">{rule.reason(answers)}</p>
      <p className="result-card__summary">{rule.summary}</p>
      <ul className="result-card__requirements">
        {rule.requirements.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
      {extra && <p className="result-card__extra">{extra}</p>}
      <div className="result-card__offices">
        {offices.map((o, i) => <OfficeRow key={i} office={o} />)}
      </div>
    </article>
  );
}
