import CheckboxGroup from "./form/CheckboxGroup";
import RadioGroup from "./form/RadioGroup";
import NumberField from "./form/NumberField";
import SelectField from "./form/SelectField";
import CheckFieldset from "./form/CheckFieldset";
import MildExceptionFields from "./MildExceptionFields";
import {
  TREATMENT_OPTIONS, NUMBER_FIELDS,
  ASCITES_OPTIONS, ENCEPHALOPATHY_OPTIONS, GENERAL_STATUS_OPTIONS, LABOR_STATUS_OPTIONS,
  CHECK_GROUPS, ALP_RATIO_OPTIONS, LIVER_TRANSPLANT_OPTIONS,
  SCREENING_OPTIONS, RESIDENCE_OPTIONS, WARD_OPTIONS, DESIGNATED_DISEASE_IDS,
  BC_VARIX_OPTIONS, BC_PORTAL_SIGN_OPTIONS, BC_ACTIVITY_OPTIONS,
} from "../domain/constants";

export default function ClinicalForm({ answers, setAnswers, clinical, setClinical }) {
  const setAnswer = (key, val) => setAnswers((prev) => ({ ...prev, [key]: val }));
  const setClinicalField = (key, val) => setClinical((prev) => ({ ...prev, [key]: val }));
  const toggleCheck = (key, checked) => setClinicalField(key, checked);

  const hasHepatitisVirus = answers.diagnosis.includes("hbv") || answers.diagnosis.includes("hcv");
  const isDesignatedDisease = answers.diagnosis.some((id) => DESIGNATED_DISEASE_IDS.includes(id));
  const hasPortalHypertensionDisease = answers.diagnosis.includes("budd_chiari") || answers.diagnosis.includes("portal_hypertension");

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

      {hasPortalHypertensionDisease && (
        <fieldset className="clinical-group">
          <legend>重症度分類の5因子（バッド・キアリ症候群/特発性門脈圧亢進症の判定に使用）</legend>
          <p className="qstep__hint">血清総ビリルビン値・肝性脳症は上の項目を使用します。あわせて以下もご確認ください。</p>
          <SelectField label="食道・胃・異所性静脈瘤" options={BC_VARIX_OPTIONS} value={clinical.bcVarix} onChange={(v) => setClinicalField("bcVarix", v)} />
          <SelectField label="門脈圧亢進所見" options={BC_PORTAL_SIGN_OPTIONS} value={clinical.bcPortalSign} onChange={(v) => setClinicalField("bcPortalSign", v)} />
          <SelectField label="身体活動制限" options={BC_ACTIVITY_OPTIONS} value={clinical.bcActivity} onChange={(v) => setClinicalField("bcActivity", v)} />
          <label className="clinical-check">
            <input
              type="checkbox"
              checked={!!clinical.bcGiBleeding}
              onChange={(e) => setClinicalField("bcGiBleeding", e.target.checked)}
            />
            <span>現在、活動性または治療抵抗性の消化管出血がある</span>
          </label>
        </fieldset>
      )}

      {isDesignatedDisease && (
        <fieldset className="clinical-group">
          <legend>指定難病の軽症者特例</legend>
          <p className="qstep__hint">重症度基準を満たさない場合でも、医療費が高額な月が続いている、または今後その予定があれば対象になることがあります</p>
          <MildExceptionFields clinical={clinical} setClinicalField={setClinicalField} />
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
