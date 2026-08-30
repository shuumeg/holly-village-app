import RadioGroup from "./form/RadioGroup";
import { RESIDENCE_OPTIONS, WARD_OPTIONS } from "../domain/constants";

export default function ResidenceOnlyStep({ answers, setAnswers, onNext, onBack }) {
  const setAnswer = (key, val) => setAnswers((prev) => ({ ...prev, [key]: val }));
  const canSubmit = answers.residence && (answers.residence !== "kawasaki" || answers.ward);

  return (
    <div className="disease-step">
      <p className="qstep__title">お住まい（窓口案内に使用します）</p>
      <RadioGroup
        name="residence"
        options={RESIDENCE_OPTIONS}
        value={answers.residence}
        onChange={(v) => {
          setAnswer("residence", v);
          if (v !== "kawasaki") setAnswer("ward", null);
        }}
      />

      {answers.residence === "kawasaki" && (
        <>
          <p className="qstep__title">お住まいの区</p>
          <RadioGroup name="ward" options={WARD_OPTIONS} value={answers.ward} onChange={(v) => setAnswer("ward", v)} />
        </>
      )}

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
