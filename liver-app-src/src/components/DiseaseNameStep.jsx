import { useState } from "react";
import { searchDiseases, findDiagnosisIdByName } from "../domain/diseaseMaster";

export default function DiseaseNameStep({ onConfirm }) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const candidates = searchDiseases(trimmed);

  const handlePick = (d) => onConfirm(d.diagnosisId, d.name);
  const handleUseAsIs = () => {
    if (!trimmed) return;
    onConfirm(findDiagnosisIdByName(trimmed), trimmed);
  };
  const handleUnknown = () => onConfirm("unknown", "まだ診断されていない／わからない");

  return (
    <div className="disease-step">
      <p className="qstep__title">病名を入力してください</p>
      <p className="qstep__hint">医師から伝えられている診断名を入力すると、候補が表示されます</p>

      <input
        type="text"
        className="disease-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="例：C型肝炎、肝硬変 など"
        autoFocus
      />

      {trimmed && (
        <div className="option-list disease-step__candidates">
          {candidates.length > 0 ? (
            candidates.map((d) => (
              <button
                key={d.name}
                type="button"
                className="option disease-candidate"
                onClick={() => handlePick(d)}
              >
                <span className="disease-candidate__name">{d.name}</span>
                <span className="disease-candidate__category">{d.category}</span>
              </button>
            ))
          ) : (
            <p className="qstep__hint">候補が見つかりません。入力した病名のまま次へ進めます。</p>
          )}
        </div>
      )}

      <div className="wizard__nav wizard__nav--single">
        <button type="button" className="btn-primary" disabled={!trimmed} onClick={handleUseAsIs}>
          この病名のまま次へ
        </button>
      </div>

      <button type="button" className="disease-step__unknown-link" onClick={handleUnknown}>
        まだ診断されていない／わからない
      </button>
    </div>
  );
}
