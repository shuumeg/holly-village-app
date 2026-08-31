import { useState } from "react";
import { DESIGNATED_DISEASE_INFO } from "../domain/calculations";
import { DESIGNATED_DISEASE_IDS } from "../domain/constants";
import MildExceptionFields from "./MildExceptionFields";

const DOCTOR_ANSWER_OPTIONS = [
  { id: "eligible", label: "医師から「該当する」と回答があった" },
  { id: "mild", label: "医師から「該当しない」と回答があった" },
  { id: "unknown", label: "まだ確認していない（血液検査値等から判定する）" },
];

export default function SeverityConfirmStep({ diagnosisIds, clinical, setClinical, onDone, onBack }) {
  const setClinicalField = (key, val) => setClinical((prev) => ({ ...prev, [key]: val }));
  const [alreadyCertified, setAlreadyCertified] = useState(null); // null=未確認 | true | false
  const [doctorAnswer, setDoctorAnswer] = useState(null);
  const diseaseId = diagnosisIds.find((id) => DESIGNATED_DISEASE_IDS.includes(id));
  const info = DESIGNATED_DISEASE_INFO[diseaseId];

  if (alreadyCertified === null) {
    return (
      <div className="disease-step">
        <p className="qstep__title">「{info.disease}」の指定難病医療費助成（受給者証）は、すでに利用していますか？</p>
        <p className="qstep__hint">
          すでに受給者証を持っている場合、重症度分類はすでに確認済みのため、この確認は省略して次に進みます。
        </p>
        <div className="option-list">
          <button
            type="button"
            className="option disease-candidate"
            onClick={() => onDone(diseaseId, "eligible", true)}
          >
            <span className="disease-candidate__name">すでに利用している（受給者証を持っている）</span>
          </button>
          <button
            type="button"
            className="option disease-candidate"
            onClick={() => setAlreadyCertified(false)}
          >
            <span className="disease-candidate__name">まだ利用していない／わからない</span>
          </button>
        </div>
        <button type="button" className="disease-step__unknown-link" onClick={onBack}>
          ← 病名を選び直す
        </button>
      </div>
    );
  }

  return (
    <div className="disease-step">
      <p className="qstep__title">「{info.disease}」の重症度分類</p>
      <article className="result-card">
        <p className="result-card__summary">{info.criteria}</p>

        {info.criteriaGroups && (
          <div className="severity-criteria-groups">
            {info.criteriaGroups.map((g) => (
              <div key={g.title} className="severity-criteria-group">
                <strong>{g.title}</strong>
                <ul>
                  {g.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {info.stages && (
          <>
            <ul className="severity-stage-list">
              {info.stages.map((s) => (
                <li key={s.label} className={s.target ? "severity-stage--target" : ""}>
                  <strong>{s.label}</strong>：{s.text}
                </li>
              ))}
            </ul>
            <p className="result-card__summary">{info.stageThresholdLabel}が対象です。</p>
          </>
        )}

        {info.mrsScale && (
          <>
            <p className="qstep__hint">神経障害パス：modified Rankin Scale（mRS）</p>
            <ul className="severity-stage-list">
              {info.mrsScale.map((s) => (
                <li key={s.label} className={s.target ? "severity-stage--target" : ""}>
                  <strong>{s.label}</strong>：{s.text}
                </li>
              ))}
            </ul>
            <p className="result-card__summary">mRS 3以上が対象です。</p>
          </>
        )}

        {info.heatmap && (
          <div className="ckd-heatmap-wrap">
            <p className="qstep__hint">腎障害パス：CKD重症度分類ヒートマップが赤の部分の場合、対象です。</p>
            <table className="ckd-heatmap">
              <thead>
                <tr>
                  <th colSpan={2} />
                  {info.heatmap.columns.map((col) => (
                    <th key={col.id}>
                      {col.label}
                      <br />
                      <span className="ckd-heatmap__sub">{col.sub}</span>
                      <br />
                      <span className="ckd-heatmap__sub">{col.range}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {info.heatmap.rows.map((row, i) => (
                  <tr key={row.id}>
                    {i === 0 && <th rowSpan={info.heatmap.rows.length} className="ckd-heatmap__axis">GFR区分</th>}
                    <th>
                      {row.label}
                      <br />
                      <span className="ckd-heatmap__sub">{row.sub}</span>
                      <br />
                      <span className="ckd-heatmap__sub">{row.range}</span>
                    </th>
                    {row.colors.map((color, j) => (
                      <td key={j} className={`ckd-heatmap__cell ckd-heatmap__cell--${color}`}>
                        {{ green: "緑", yellow: "黄", orange: "オレンジ", red: "赤" }[color]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
      <p className="qstep__hint">
        重症度分類は、適切な医学的管理の下で治療を受けている状態で、<strong>直近6か月間で最も悪かった状態</strong>で判断します（今この瞬間の状態ではありません）。
      </p>
      <p className="qstep__hint">
        主治医に電話で「{info.stages ? `直近6か月で最も悪かった時期は、どの区分に該当しますか（${info.stageThresholdLabel}が対象です）` : "直近6か月で最も悪かった時期は、この重症度分類の基準に該当しますか"}？」と確認し、回答を選んでください。
      </p>

      {!doctorAnswer && (
        <div className="option-list">
          {DOCTOR_ANSWER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="option disease-candidate"
              onClick={() => setDoctorAnswer(opt.id)}
            >
              <span className="disease-candidate__name">{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {doctorAnswer === "mild" && (
        <fieldset className="clinical-group">
          <legend>指定難病の軽症者特例</legend>
          <p className="qstep__hint">
            重症度基準を満たさない場合でも、医療費が高額な月が続いている、または今後その予定があれば対象になることがあります
          </p>
          <MildExceptionFields clinical={clinical} setClinicalField={setClinicalField} />
        </fieldset>
      )}

      {doctorAnswer && (
        <>
          <p className="qstep__title">続けて、身体障害者手帳・障害年金など他の制度も判定しますか？</p>
          <div className="option-list">
            <button
              type="button"
              className="option disease-candidate"
              onClick={() => onDone(diseaseId, doctorAnswer, true)}
            >
              <span className="disease-candidate__name">はい、続けて判定する</span>
            </button>
            <button
              type="button"
              className="option disease-candidate"
              onClick={() => onDone(diseaseId, doctorAnswer, false)}
            >
              <span className="disease-candidate__name">いいえ、この結果だけ確認する</span>
            </button>
          </div>
          <button type="button" className="disease-step__unknown-link" onClick={() => setDoctorAnswer(null)}>
            ← 選び直す
          </button>
        </>
      )}

      {!doctorAnswer && (
        <button type="button" className="disease-step__unknown-link" onClick={() => setAlreadyCertified(null)}>
          ← 戻る
        </button>
      )}
    </div>
  );
}
