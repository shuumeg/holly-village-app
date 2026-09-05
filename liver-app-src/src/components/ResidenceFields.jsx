import RadioGroup from "./form/RadioGroup";
import { RESIDENCE_OPTIONS, WARD_OPTIONS, TOKYO_MUNICIPALITY_OPTIONS } from "../domain/constants";

// お住まい（窓口案内に使用）の入力欄。川崎市は区、東京都は対応市区まで選ぶと窓口を特定できる。
// QuickCheckStep・ResidenceOnlyStep・ClinicalFormの3箇所で使う。
export function residenceComplete(answers) {
  if (!answers.residence) return false;
  if (answers.residence === "kawasaki") return !!answers.ward;
  if (answers.residence === "tokyo") return !!answers.tokyoMunicipality;
  return true;
}

export default function ResidenceFields({ answers, setAnswer }) {
  return (
    <>
      <fieldset className="clinical-group">
        <legend>お住まい（窓口案内に使用します）</legend>
        <RadioGroup
          name="residence"
          options={RESIDENCE_OPTIONS}
          value={answers.residence}
          onChange={(v) => {
            setAnswer("residence", v);
            if (v !== "kawasaki") setAnswer("ward", null);
            if (v !== "tokyo") setAnswer("tokyoMunicipality", null);
          }}
        />
      </fieldset>

      {answers.residence === "kawasaki" && (
        <fieldset className="clinical-group">
          <legend>お住まいの区</legend>
          <RadioGroup name="ward" options={WARD_OPTIONS} value={answers.ward} onChange={(v) => setAnswer("ward", v)} />
        </fieldset>
      )}

      {answers.residence === "tokyo" && (
        <fieldset className="clinical-group">
          <legend>お住まいの市区</legend>
          <RadioGroup
            name="tokyoMunicipality"
            options={TOKYO_MUNICIPALITY_OPTIONS}
            value={answers.tokyoMunicipality}
            onChange={(v) => setAnswer("tokyoMunicipality", v)}
          />
        </fieldset>
      )}
    </>
  );
}
