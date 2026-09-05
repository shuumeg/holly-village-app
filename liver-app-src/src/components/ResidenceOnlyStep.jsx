import ResidenceFields, { residenceComplete } from "./ResidenceFields";

export default function ResidenceOnlyStep({ answers, setAnswers, onNext, onBack }) {
  const setAnswer = (key, val) => setAnswers((prev) => ({ ...prev, [key]: val }));
  const canSubmit = residenceComplete(answers);

  return (
    <div className="disease-step">
      <ResidenceFields answers={answers} setAnswer={setAnswer} />

      <div className="wizard__nav">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← 戻る
        </button>
        <button type="button" className="btn-primary" disabled={!canSubmit} onClick={onNext}>
          結果を見る
        </button>
      </div>
    </div>
  );
}
