/* ==========================================================
   病名入力直後（詳細な臨床質問の前）に見せる、制度候補のプレビュー。
   ここでの判定は病名のみに基づく大まかな絞り込みであり、
   最終的な該当可否は詳細な臨床質問の回答後、Results.jsx で判定する。
   ========================================================== */

const DESIGNATED_DISEASE_LABELS = {
  pbc: '原発性胆汁性胆管炎（PBC）',
  psc: '原発性硬化性胆管炎（PSC）',
  aih: '自己免疫性肝炎',
  wilson: 'ウィルソン病',
  budd_chiari: 'バッド・キアリ症候群',
  portal_hypertension: '特発性門脈圧亢進症',
};

export function candidateProgramsFor(diagnosisIds) {
  const ids = Array.isArray(diagnosisIds) ? diagnosisIds : [diagnosisIds];
  const has = (id) => ids.includes(id);
  const hasVirus = has('hbv') || has('hcv');
  const list = [];

  const designatedLabel = ids.map((id) => DESIGNATED_DISEASE_LABELS[id]).find(Boolean);
  if (designatedLabel) {
    list.push({
      category: '指定難病',
      name: `指定難病医療費助成（${designatedLabel}）`,
      note: '重症度基準を満たすと医療費助成の対象になる可能性があります。',
    });
  }

  if (hasVirus) {
    list.push({
      category: '医療費助成',
      name: '肝炎医療費助成',
      note: '核酸アナログ製剤・DAA・インターフェロン治療を受けている場合に対象になる可能性があります。',
    });
    list.push({
      category: '検診',
      name: '肝炎ウイルス陽性者フォローアップ事業',
      note: '治療につながっていない場合にご案内できます。',
    });
  }

  if (has('liver_cancer') || (has('cirrhosis_decompensated') && hasVirus)) {
    list.push({
      category: '医療費助成',
      name: '肝がん・重度肝硬変治療研究促進事業',
      note: '肝炎ウイルスが原因の場合に対象になる可能性があります。',
    });
  }

  if (has('unknown')) {
    list.push({
      category: '検診',
      name: '肝炎ウイルス無料検査',
      note: '肝炎ウイルス検査を受けたことがない方は無料で受けられます。',
    });
  } else {
    list.push({
      category: '手帳',
      name: '身体障害者手帳（肝臓機能障害）',
      note: '血液検査値などから等級の目安を判定します。',
    });
    list.push({
      category: '年金',
      name: '障害年金（肝疾患）',
      note: '血液検査値・一般状態区分などから等級の目安を判定します。',
    });
  }

  list.push({
    category: '医療費',
    name: '高額療養費制度',
    note: '医療費の自己負担が高額になった場合に共通して確認できる制度です。',
  });

  return list;
}
