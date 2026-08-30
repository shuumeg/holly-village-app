import NumberField from "./form/NumberField";

// 指定難病の軽症者特例（重症度基準を満たさなくても、高額な医療費が続いていれば対象になる仕組み）の入力欄。
// ClinicalForm（詳細質問の一括入力）と SeverityConfirmStep（医師から「該当しない」と言われた直後）の両方で使う。
export default function MildExceptionFields({ clinical, setClinicalField }) {
  return (
    <>
      <NumberField
        label="直近12か月で、医療費総額（10割相当）が33,330円を超えた月の回数"
        unit="回"
        step="1"
        value={clinical.highCostMonths}
        onChange={(v) => setClinicalField("highCostMonths", v)}
      />
      <label className="clinical-check">
        <input
          type="checkbox"
          checked={!!clinical.plannedHighCostDrug}
          onChange={(e) => setClinicalField("plannedHighCostDrug", e.target.checked)}
        />
        <span>今後、高額な医薬品（分子標的薬・生物学的製剤等）による治療開始を予定している</span>
      </label>
    </>
  );
}
