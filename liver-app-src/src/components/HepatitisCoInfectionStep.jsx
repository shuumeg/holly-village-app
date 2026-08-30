export default function HepatitisCoInfectionStep({ primaryLabel, onConfirm, onBack }) {
  return (
    <div className="disease-step">
      <p className="qstep__title">B型・C型肝炎ウイルスの感染はありますか？</p>
      <p className="qstep__hint">
        「{primaryLabel}」の原因がB型・C型肝炎の場合、肝がん・重度肝硬変治療研究促進事業などの追加の制度候補が対象になることがあるため、あわせて確認します。
      </p>

      <div className="option-list">
        <button type="button" className="option disease-candidate" onClick={() => onConfirm("hbv")}>
          <span className="disease-candidate__name">B型肝炎の感染がある</span>
        </button>
        <button type="button" className="option disease-candidate" onClick={() => onConfirm("hcv")}>
          <span className="disease-candidate__name">C型肝炎の感染がある</span>
        </button>
        <button type="button" className="option disease-candidate" onClick={() => onConfirm(null)}>
          <span className="disease-candidate__name">感染はない／わからない</span>
        </button>
      </div>

      <button type="button" className="disease-step__unknown-link" onClick={onBack}>
        ← 病名を選び直す
      </button>
    </div>
  );
}
