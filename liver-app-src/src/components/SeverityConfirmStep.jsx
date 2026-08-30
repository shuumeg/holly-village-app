import { useState } from "react";
import { DESIGNATED_DISEASE_INFO } from "../domain/calculations";
import { DESIGNATED_DISEASE_IDS } from "../domain/constants";

const DOCTOR_ANSWER_OPTIONS = [
  { id: "eligible", label: "医師から「該当する」と回答があった" },
  { id: "mild", label: "医師から「該当しない」と回答があった" },
  { id: "unknown", label: "まだ確認していない（血液検査値等から判定する）" },
];

export default function SeverityConfirmStep({ diagnosisIds, onDone, onBack }) {
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
      </article>
      <p className="qstep__hint">
        主治医に電話で「この重症度分類の基準に該当しますか？」と確認し、回答を選んでください。
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
