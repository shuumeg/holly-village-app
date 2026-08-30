import { candidateProgramsFor } from "../domain/candidatePrograms";

export default function CandidatePreviewStep({ diagnosisIds, diagnosisLabel, onNext, onBack }) {
  const programs = candidateProgramsFor(diagnosisIds);

  return (
    <div className="candidate-step">
      <p className="qstep__title">「{diagnosisLabel}」で確認できる制度の候補</p>
      <p className="qstep__hint">
        現時点では病名のみに基づく候補です。この後の質問（血液検査値・症状など）に答えると、より詳しい該当可否を判定できます。
      </p>

      <div className="candidate-step__list">
        {programs.map((p) => (
          <article key={p.name} className="result-card candidate-card">
            <span className="result-card__badge">{p.category}</span>
            <h3 className="result-card__name">{p.name}</h3>
            <p className="result-card__summary">{p.note}</p>
          </article>
        ))}
      </div>

      <div className="wizard__nav">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← 病名を選び直す
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          くわしく判定する
        </button>
      </div>
    </div>
  );
}
