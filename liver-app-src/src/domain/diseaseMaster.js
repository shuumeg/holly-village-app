/* ==========================================================
   肝疾患 病名マスタ（病名検索ステップ用）
   出典: CODE/統計他者チェック/肝疾患.gs の病名マスタを流用。
   diagnosisId は calculations.js が参照する診断idに対応させ、
   既存の判定ロジックをそのまま使えるようにしている。
   ウィルソン病・バッド・キアリ症候群・特発性門脈圧亢進症は肝疾患.gs
   のマスタには無いが、指定難病判定（evalDesignatedDiseases）に必要なため追加した。
   ========================================================== */

export const DISEASE_MASTER = [
  // ウイルス性肝炎
  { name: 'B型肝炎(急性)', icd10: 'B16', category: 'ウイルス性肝炎', diagnosisId: 'hbv' },
  { name: 'B型肝炎(慢性)', icd10: 'B18.1', category: 'ウイルス性肝炎', diagnosisId: 'hbv' },
  { name: 'C型肝炎(急性)', icd10: 'B17.1', category: 'ウイルス性肝炎', diagnosisId: 'hcv' },
  { name: 'C型肝炎(慢性)', icd10: 'B18.2', category: 'ウイルス性肝炎', diagnosisId: 'hcv' },
  { name: 'A型肝炎', icd10: 'B15', category: 'ウイルス性肝炎', diagnosisId: 'other' },
  { name: 'E型肝炎', icd10: 'B17.2', category: 'ウイルス性肝炎', diagnosisId: 'other' },

  // 肝硬変
  { name: '代償性肝硬変', icd10: 'K74', category: '肝硬変', diagnosisId: 'cirrhosis_compensated' },
  { name: '非代償性肝硬変', icd10: 'K74', category: '肝硬変', diagnosisId: 'cirrhosis_decompensated' },

  // 肝がん
  { name: '肝細胞癌', icd10: 'C22.0', category: '肝がん', diagnosisId: 'liver_cancer' },
  { name: '肝内胆管癌(胆管細胞癌)', icd10: 'C22.1', category: '肝がん', diagnosisId: 'liver_cancer' },

  // 脂肪性肝疾患
  { name: '非アルコール性脂肪性肝疾患(NAFLD)', icd10: 'K76.0', category: '脂肪性肝疾患', diagnosisId: 'other' },
  { name: '非アルコール性脂肪肝炎(NASH)', icd10: 'K76.0', category: '脂肪性肝疾患', diagnosisId: 'other' },

  // アルコール性肝疾患
  { name: 'アルコール性脂肪肝', icd10: 'K70.0', category: 'アルコール性肝疾患', diagnosisId: 'other' },
  { name: 'アルコール性肝炎', icd10: 'K70.1', category: 'アルコール性肝疾患', diagnosisId: 'other' },
  { name: 'アルコール性肝硬変', icd10: 'K70.3', category: 'アルコール性肝疾患', diagnosisId: 'other' },

  // 自己免疫性・代謝性肝疾患
  { name: '自己免疫性肝炎', icd10: 'K75.4', category: '自己免疫性・代謝性肝疾患', diagnosisId: 'aih' },
  { name: '原発性胆汁性胆管炎(PBC)', icd10: 'K74.3', category: '自己免疫性・代謝性肝疾患', diagnosisId: 'pbc' },
  { name: '原発性硬化性胆管炎(PSC)', icd10: 'K83.0', category: '自己免疫性・代謝性肝疾患', diagnosisId: 'psc' },
  { name: 'ウィルソン病', icd10: 'E83.0', category: '自己免疫性・代謝性肝疾患', diagnosisId: 'wilson' },

  // 急性肝不全・薬剤性
  { name: '劇症肝炎(急性肝不全)', icd10: 'K72.0', category: '急性肝不全・薬剤性', diagnosisId: 'other' },
  { name: '薬物性肝障害', icd10: 'K71', category: '急性肝不全・薬剤性', diagnosisId: 'other' },

  // その他（指定難病判定に必要なため追加）
  { name: 'バッド・キアリ症候群', icd10: 'I82.0', category: 'その他', diagnosisId: 'budd_chiari' },
  { name: '特発性門脈圧亢進症', icd10: 'K76.6', category: 'その他', diagnosisId: 'portal_hypertension' },
];

export function searchDiseases(query) {
  const q = query.trim();
  if (!q) return [];
  return DISEASE_MASTER.filter((d) => d.name.includes(q));
}

export function findDiagnosisIdByName(name) {
  const hit = DISEASE_MASTER.find((d) => d.name === name);
  return hit ? hit.diagnosisId : 'other';
}
