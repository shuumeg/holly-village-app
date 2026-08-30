import { useState } from "react";
import DiseaseNameStep from "./components/DiseaseNameStep";
import HepatitisCoInfectionStep from "./components/HepatitisCoInfectionStep";
import CandidatePreviewStep from "./components/CandidatePreviewStep";
import ClinicalForm from "./components/ClinicalForm";
import Results from "./components/Results";
import { INITIAL_ANSWERS, INITIAL_CLINICAL } from "./domain/constants";
import "./App.css";

// 肝硬変・肝がんはB型/C型肝炎の合併有無で「肝がん・重度肝硬変治療研究促進事業」等の
// 対象可否が変わるため、この3病名を選んだ時だけ合併確認のステップを挟む。
const NEEDS_HEPATITIS_CHECK = ["cirrhosis_compensated", "cirrhosis_decompensated", "liver_cancer"];

export default function App() {
  const [step, setStep] = useState("name"); // "name" | "hepatitis" | "candidates" | "clinical" | "results"
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [clinical, setClinical] = useState(INITIAL_CLINICAL);

  const canSubmit = answers.screening && answers.residence && (answers.residence !== "kawasaki" || answers.ward);

  const goTo = (next) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNameConfirm = (diagnosisId, label) => {
    setAnswers((prev) => ({ ...prev, diagnosis: [diagnosisId], diagnosisLabel: label }));
    goTo(NEEDS_HEPATITIS_CHECK.includes(diagnosisId) ? "hepatitis" : "candidates");
  };

  const handleHepatitisConfirm = (virusId) => {
    setAnswers((prev) => ({ ...prev, diagnosis: virusId ? [prev.diagnosis[0], virusId] : [prev.diagnosis[0]] }));
    goTo("candidates");
  };

  const handleBackFromCandidates = () => {
    goTo(NEEDS_HEPATITIS_CHECK.includes(answers.diagnosis[0]) ? "hepatitis" : "name");
  };

  const handleReset = () => {
    setAnswers(INITIAL_ANSWERS);
    setClinical(INITIAL_CLINICAL);
    goTo("name");
  };

  return (
    <div className="app-shell">
      <a href="../index.html" className="app-header__back">← ホーム</a>
      <header className="app-header app-header--plain">
        <h1 className="app-logo"><span className="app-logo__bold">Social Work</span><span className="app-logo__light">Navi.</span></h1>
        <p className="app-feature-tag">肝疾患の社会保障判定<span className="cover__app-badge">β版</span></p>
        <p className="subtitle">1回の入力で、指定難病・身体障害者手帳・障害年金の該当可能性を同時に判定します</p>
      </header>

      <main className="app-main app-main--wide">
        {step === "name" && <DiseaseNameStep onConfirm={handleNameConfirm} />}

        {step === "hepatitis" && (
          <HepatitisCoInfectionStep
            primaryLabel={answers.diagnosisLabel}
            onConfirm={handleHepatitisConfirm}
            onBack={() => goTo("name")}
          />
        )}

        {step === "candidates" && (
          <CandidatePreviewStep
            diagnosisIds={answers.diagnosis}
            diagnosisLabel={answers.diagnosisLabel}
            onNext={() => goTo("clinical")}
            onBack={handleBackFromCandidates}
          />
        )}

        {step === "clinical" && (
          <>
            <ClinicalForm answers={answers} setAnswers={setAnswers} clinical={clinical} setClinical={setClinical} />
            {!canSubmit && (
              <p className="qstep__error qstep__error--static">「肝炎ウイルス検査の受診歴」「お住まい」は必須項目です（川崎市の場合は区も）</p>
            )}
            <div className="wizard__nav">
              <button type="button" className="btn-secondary" onClick={() => goTo("candidates")}>
                ← 戻る
              </button>
              <button type="button" className="btn-primary" disabled={!canSubmit} onClick={() => goTo("results")}>
                判定する
              </button>
            </div>
          </>
        )}

        {step === "results" && (
          <>
            <Results answers={answers} clinical={clinical} />
            <div className="wizard__nav">
              <button type="button" className="btn-secondary" onClick={() => goTo("clinical")}>
                ← 入力内容を確認・修正する
              </button>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                もう一度最初から入力する
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>※本ツールは制度候補の絞り込みを支援する参考情報であり、最終的な該当可否・等級等は指定医の診断や各制度の窓口での確認により判定されます。制度の内容は変更される場合がありますので、最新情報は各窓口・自治体公式ページにてご確認ください。</p>
        <p className="app-footer__copyright">© 2026 Social Work Navi. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
