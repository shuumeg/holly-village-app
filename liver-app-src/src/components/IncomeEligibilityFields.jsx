import SelectField from "./form/SelectField";
import { AGE_GROUP_OPTIONS, INCOME_TIER_UNDER70_OPTIONS, COPAY_RATIO_70PLUS_OPTIONS } from "../domain/constants";

// 肝がん・重度肝硬変治療研究促進事業の所得要件（年収目安約370万円以下）の入力欄。
// ClinicalForm（詳細質問の一括入力）と Results（判定サマリーでの情報不足の補完）の両方で使う。
export default function IncomeEligibilityFields({ clinical, setClinicalField }) {
  return (
    <>
      <SelectField label="年齢" options={AGE_GROUP_OPTIONS} value={clinical.ageGroup} onChange={(v) => setClinicalField("ageGroup", v)} />
      {clinical.ageGroup === "under70" && (
        <SelectField
          label="高額療養費の所得区分（限度額適用認定証で確認）"
          options={INCOME_TIER_UNDER70_OPTIONS}
          value={clinical.incomeTierUnder70}
          onChange={(v) => setClinicalField("incomeTierUnder70", v)}
        />
      )}
      {clinical.ageGroup === "over70" && (
        <SelectField
          label="自己負担割合（保険証・高齢受給者証で確認）"
          options={COPAY_RATIO_70PLUS_OPTIONS}
          value={clinical.copayRatio70Plus}
          onChange={(v) => setClinicalField("copayRatio70Plus", v)}
        />
      )}
    </>
  );
}
