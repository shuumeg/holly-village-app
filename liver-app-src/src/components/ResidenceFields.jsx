import RadioGroup from "./form/RadioGroup";
import SelectField from "./form/SelectField";
import { RESIDENCE_OPTIONS, WARD_OPTIONS, TOKYO_MUNICIPALITY_OPTIONS, KANAGAWA_OTHER_AREA_OPTIONS } from "../domain/constants";

// お住まい（窓口案内に使用）の入力欄。川崎市は区、東京都は対応市区まで選ぶと窓口を特定できる
// （必須）。神奈川県内（川崎市以外）の横浜市・相模原市・藤沢市は任意選択（不明でも判定できる
// よう、選ばなくても汎用案内にフォールバックする）。
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
            if (v !== "kanagawa_other") setAnswer("kanagawaArea", null);
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

      {answers.residence === "kanagawa_other" && (
        <fieldset className="clinical-group">
          <legend>お住まいの市区町村（横浜市・相模原市・藤沢市の場合、窓口の特定に使用）</legend>
          <SelectField
            label="市区町村"
            options={KANAGAWA_OTHER_AREA_OPTIONS}
            value={answers.kanagawaArea}
            onChange={(v) => setAnswer("kanagawaArea", v)}
            defaultLabel="わからない／その他の市区町村"
          />
        </fieldset>
      )}
    </>
  );
}
