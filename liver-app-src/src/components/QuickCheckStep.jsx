import CheckboxGroup from "./form/CheckboxGroup";
import RadioGroup from "./form/RadioGroup";
import IncomeEligibilityFields from "./IncomeEligibilityFields";
import { TREATMENT_OPTIONS, SCREENING_OPTIONS, RESIDENCE_OPTIONS, WARD_OPTIONS } from "../domain/constants";

// 血液検査値などの詳しい入力をしなくても判定できる「肝がん・重度肝硬変治療研究促進事業」
// 「肝炎医療費助成」だけを先に確認したい場合の、検査値抜きの分岐画面。
// ここで集めた回答（治療の状況・所得区分・受診歴・お住まい）は、
// 「続けて判定する」を選んだ場合もそのままClinicalFormに引き継がれる。
export default function QuickCheckStep({
  answers, setAnswers, clinical, setClinical,
  hasHepatitisVirus, cancerCirrhosisRelevant,
  onContinueFull, onQuickResults, onBack,
}) {
  const setAnswer = (key, val) => setAnswers((prev) => ({ ...prev, [key]: val }));
  const setClinicalField = (key, val) => setClinical((prev) => ({ ...prev, [key]: val }));

  const canSubmit = answers.residence && (answers.residence !== "kawasaki" || answers.ward);

  return (
    <div className="disease-step">
      <p className="qstep__title">治療の状況・お住まいを確認します</p>
      <p className="qstep__hint">
        肝がん・重度肝硬変治療研究促進事業や肝炎医療費助成は、血液検査値を入力しなくてもここまでの回答で判定できます。
      </p>

      {hasHepatitisVirus && (
        <fieldset className="clinical-group">
          <legend>治療の状況</legend>
          <p className="qstep__hint">現在の治療状況を選んでください（複数選択可）</p>
          <CheckboxGroup options={TREATMENT_OPTIONS} value={answers.treatment} onChange={(v) => setAnswer("treatment", v)} />
        </fieldset>
      )}

      {cancerCirrhosisRelevant && (
        <fieldset className="clinical-group">
          <legend>所得区分（肝がん・重度肝硬変治療研究促進事業の所得要件の判定に使用）</legend>
          <p className="qstep__hint">
            この事業には所得要件（年収目安約370万円以下）があります。ご自身の高額療養費の所得区分（限度額適用認定証・保険証で確認できます）を選んでください。
          </p>
          <IncomeEligibilityFields clinical={clinical} setClinicalField={setClinicalField} />
        </fieldset>
      )}

      {!hasHepatitisVirus && (
        <fieldset className="clinical-group">
          <legend>肝炎ウイルス検査の受診歴</legend>
          <RadioGroup name="screening" options={SCREENING_OPTIONS} value={answers.screening} onChange={(v) => setAnswer("screening", v)} />
        </fieldset>
      )}

      <fieldset className="clinical-group">
        <legend>お住まい（窓口案内に使用します）</legend>
        <RadioGroup
          name="residence"
          options={RESIDENCE_OPTIONS}
          value={answers.residence}
          onChange={(v) => {
            setAnswer("residence", v);
            if (v !== "kawasaki") setAnswer("ward", null);
          }}
        />
      </fieldset>

      {answers.residence === "kawasaki" && (
        <fieldset className="clinical-group">
          <legend>お住まいの区</legend>
          <RadioGroup name="ward" options={WARD_OPTIONS} value={answers.ward} onChange={(v) => setAnswer("ward", v)} />
        </fieldset>
      )}

      <p className="qstep__title">続けて、指定難病・身体障害者手帳・障害年金の該当も判定しますか？</p>
      <p className="qstep__hint">血液検査値・一般状態区分など、追加の質問に答える必要があります。</p>

      {!canSubmit && (
        <p className="qstep__error qstep__error--static">「お住まい」は必須項目です（川崎市の場合は区も）</p>
      )}

      <div className="wizard__nav">
        <button type="button" className="btn-secondary" disabled={!canSubmit} onClick={onQuickResults}>
          いいえ、この結果だけ確認する
        </button>
        <button type="button" className="btn-primary" disabled={!canSubmit} onClick={onContinueFull}>
          はい、続けて判定する
        </button>
      </div>

      <button type="button" className="disease-step__unknown-link" onClick={onBack}>
        ← 戻る
      </button>
    </div>
  );
}
