import CheckboxGroup from "./form/CheckboxGroup";
import RadioGroup from "./form/RadioGroup";
import NumberField from "./form/NumberField";
import SelectField from "./form/SelectField";
import CheckFieldset from "./form/CheckFieldset";
import {
  TREATMENT_OPTIONS, NUMBER_FIELDS,
  ASCITES_OPTIONS, ENCEPHALOPATHY_OPTIONS, GENERAL_STATUS_OPTIONS, LABOR_STATUS_OPTIONS,
  CHECK_GROUPS, ALP_RATIO_OPTIONS, LIVER_TRANSPLANT_OPTIONS,
  SCREENING_OPTIONS, RESIDENCE_OPTIONS, WARD_OPTIONS, DESIGNATED_DISEASE_IDS,
} from "../domain/constants";

export default function ClinicalForm({ answers, setAnswers, clinical, setClinical }) {
  const setAnswer = (key, val) => setAnswers((prev) => ({ ...prev, [key]: val }));
  const setClinicalField = (key, val) => setClinical((prev) => ({ ...prev, [key]: val }));
  const toggleCheck = (key, checked) => setClinicalField(key, checked);

  const hasHepatitisVirus = answers.diagnosis.includes("hbv") || answers.diagnosis.includes("hcv");
  const isDesignatedDisease = answers.diagnosis.some((id) => DESIGNATED_DISEASE_IDS.includes(id));

  return (
    <div className="clinical-form">
      {hasHepatitisVirus && (
        <fieldset className="clinical-group">
          <legend>治療の状況</legend>
          <p className="qstep__hint">現在の治療状況を選んでください（複数選択可）</p>
          <CheckboxGroup
            options={TREATMENT_OPTIONS}
            value={answers.treatment}
            onChange={(v) => setAnswer("treatment", v)}
          />
        </fieldset>
      )}

      <fieldset className="clinical-group">
        <legend>血液検査値</legend>
        <div className="clinical-fields">
          {NUMBER_FIELDS.map((f) => (
            <NumberField
              key={f.key}
              label={f.label}
              unit={f.unit}
              step={f.step}
              value={clinical[f.key]}
              onChange={(v) => setClinicalField(f.key, v)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="clinical-group">
        <legend>腹水・肝性脳症</legend>
        <SelectField label="腹水" options={ASCITES_OPTIONS} value={clinical.ascites} onChange={(v) => setClinicalField("ascites", v)} />
        <SelectField label="肝性脳症の昏睡度" options={ENCEPHALOPATHY_OPTIONS} value={clinical.encephalopathy} onChange={(v) => setClinicalField("encephalopathy", v)} />
      </fieldset>

      <fieldset className="clinical-group">
        <legend>一般状態（日常生活の様子）※障害年金の判定で重視されます</legend>
        <RadioGroup name="generalStatus" options={GENERAL_STATUS_OPTIONS} value={clinical.generalStatus} onChange={(v) => setClinicalField("generalStatus", v)} />
      </fieldset>

      <fieldset className="clinical-group">
        <legend>労働状況（参考情報）</legend>
        <RadioGroup name="laborStatus" options={LABOR_STATUS_OPTIONS} value={clinical.laborStatus} onChange={(v) => setClinicalField("laborStatus", v)} />
      </fieldset>

      {CHECK_GROUPS.map((g) => (
        <CheckFieldset key={g.title} title={g.title} items={g.items} values={clinical} onToggle={toggleCheck} />
      ))}

      {answers.diagnosis.includes("psc") && (
        <fieldset className="clinical-group">
          <legend>ALP値（原発性硬化性胆管炎の判定に使用）</legend>
          <SelectField label="ALP" options={ALP_RATIO_OPTIONS} value={clinical.alpRatio === "unknown" ? null : clinical.alpRatio} onChange={(v) => setClinicalField("alpRatio", v || "unknown")} />
        </fieldset>
      )}

      {isDesignatedDisease && (
        <fieldset className="clinical-group">
          <legend>指定難病の軽症者特例</legend>
          <p className="qstep__hint">重症度基準を満たさない場合でも、医療費が高額な月が続いている、または今後その予定があれば対象になることがあります</p>
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
        </fieldset>
      )}

      <fieldset className="clinical-group">
        <legend>肝臓移植</legend>
        <SelectField
          label="肝臓移植の有無・状況"
          options={LIVER_TRANSPLANT_OPTIONS}
          value={clinical.liverTransplant === "none" ? null : clinical.liverTransplant}
          onChange={(v) => setClinicalField("liverTransplant", v || "none")}
          defaultLabel="移植なし／未確認"
        />
      </fieldset>

      <fieldset className="clinical-group">
        <legend>肝炎ウイルス検査の受診歴</legend>
        <RadioGroup name="screening" options={SCREENING_OPTIONS} value={answers.screening} onChange={(v) => setAnswer("screening", v)} />
      </fieldset>

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
    </div>
  );
}
