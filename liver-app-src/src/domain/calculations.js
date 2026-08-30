/* ==========================================================
   肝疾患の社会保障判定 - 判定ロジック（フレームワーク非依存の純粋関数）

   身体障害者手帳・障害年金・指定難病（PBC/PSC/AIH/ウィルソン病/
   バッド・キアリ症候群/特発性門脈圧亢進症）の判定基準は、
   厚生労働省「身体障害認定基準の手引き（第12 肝臓機能障害）」
   日本年金機構「障害認定基準 第13節／肝疾患による障害」
   難病情報センター 各疾病「概要・診断基準等」（2026年8月時点）
   に基づく。制度改正等により基準が変更される場合があるため、
   最終判断は必ず指定医・専門医の診断によること。
   ========================================================== */

import { KAWASAKI_WARDS, PENSION_OFFICES, KANAGAWA_DISEASE_CONTROL, MUNICIPALITIES } from "./constants";

export function has(list, id) {
  return list.includes(id);
}

export function numOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function currentHbvHcv(answers) {
  if (has(answers.treatment, "antiviral_completed")) return false;
  return has(answers.diagnosis, "hbv") || has(answers.diagnosis, "hcv");
}

export function kawasakiWard(answers) {
  return answers.residence === "kawasaki" && answers.ward ? KAWASAKI_WARDS[answers.ward] : null;
}

// ---------- バッド・キアリ症候群/特発性門脈圧亢進症 重症度分類（5因子、門脈血行異常症の診断と治療のガイドライン） ----------
const BC_VARIX_STAGE = { none: 1, present: 2, high_risk: 3, bled: 4 };
const BC_PORTAL_SIGN_STAGE = { none: 1, untreated: 2, treated: 3 };
const BC_ACTIVITY_STAGE = { none: 1, mild: 3, severe: 4 };
const STAGE_ROMAN = { 1: "Ⅰ", 2: "Ⅱ", 3: "Ⅲ", 4: "Ⅳ", 5: "Ⅴ" };

export function calcPortalHypertensionStage(c) {
  const bil = numOrNull(c.bilirubin);
  const liverFailure = !!(bil != null && bil >= 3 && c.encephalopathy && (c.encephalopathy === "2" || c.encephalopathy === "3plus"));
  const giBleeding = !!c.bcGiBleeding;
  const varixStage = BC_VARIX_STAGE[c.bcVarix] ?? 1;
  const portalSignStage = BC_PORTAL_SIGN_STAGE[c.bcPortalSign] ?? 1;
  const activityStage = BC_ACTIVITY_STAGE[c.bcActivity] ?? 1;
  const factorStage = Math.max(varixStage, portalSignStage, activityStage);
  const stage = liverFailure || giBleeding ? 5 : factorStage;
  return { stage, roman: STAGE_ROMAN[stage], liverFailure, giBleeding, varixStage, portalSignStage, activityStage };
}

// ---------- Child-Pugh分類（身体障害者手帳・ウィルソン病肝障害パスで使用） ----------
function childPughPoint(key, v) {
  if (v == null) return null;
  switch (key) {
    case "encephalopathy":
      return v === "none" ? 1 : v === "1" || v === "2" ? 2 : 3;
    case "ascites":
      return v === "none" ? 1 : v === "mild" ? 2 : 3;
    case "albumin":
      return v > 3.5 ? 1 : v >= 2.8 ? 2 : 3;
    case "pt":
      return v > 70 ? 1 : v >= 40 ? 2 : 3;
    case "bilirubin":
      return v < 2.0 ? 1 : v <= 3.0 ? 2 : 3;
    default:
      return null;
  }
}

export function calcChildPugh(c) {
  const keys = ["encephalopathy", "ascites", "albumin", "pt", "bilirubin"];
  const points = {};
  const missing = [];
  for (const k of keys) {
    const raw = k === "encephalopathy" || k === "ascites" ? c[k] : numOrNull(c[k]);
    const p = childPughPoint(k, raw);
    points[k] = p;
    if (p == null) missing.push(k);
  }
  if (missing.length > 0) return { total: null, points, missing, threeItemRule: null };

  const total = Object.values(points).reduce((a, b) => a + b, 0);
  const highItems = keys.filter((k) => points[k] >= 2);
  const threeItemRule = highItems.length >= 3 && (points.encephalopathy >= 2 || points.ascites >= 2);
  return { total, points, missing: [], threeItemRule };
}

const CP_LABELS = { encephalopathy: "肝性脳症", ascites: "腹水", albumin: "血清アルブミン値", pt: "プロトロンビン時間", bilirubin: "血清総ビリルビン値" };
export function cpLabel(key) {
  return CP_LABELS[key] || key;
}

// ---------- 身体障害者手帳（肝臓機能障害）等級計算 ----------
export function calcHandbookGrade(c) {
  if (c.liverTransplant === "ongoing") {
    return {
      grade: 1,
      reason: "肝臓移植後、抗免疫療法を継続中のため、実施しないと仮定した状態で1級として認定されます。",
      missing: [],
    };
  }

  const cp = calcChildPugh(c);
  const atoKa = [
    { key: "billHigh", label: "ア：血清総ビリルビン値5.0mg/dL以上", val: numOrNull(c.bilirubin) != null ? numOrNull(c.bilirubin) >= 5.0 : null },
    { key: "ammoniaHigh", label: "イ：血中アンモニア濃度150μg/dL以上", val: numOrNull(c.ammonia) != null ? numOrNull(c.ammonia) >= 150 : null },
    { key: "plateletLow", label: "ウ：血小板数5万/μL以下", val: numOrNull(c.platelet) != null ? numOrNull(c.platelet) <= 5 : null },
    { key: "hccHistory", label: "エ：原発性肝がん治療の既往", val: !!c.hccHistory },
    { key: "sbpHistory", label: "オ：特発性細菌性腹膜炎治療の既往", val: !!c.sbpHistory },
    { key: "varicesHistory", label: "カ：胃食道静脈瘤治療の既往", val: !!c.varicesHistory },
    { key: "hbcvCurrent", label: "キ：現在のB型/C型肝炎ウイルスの持続的感染", val: !!c.currentHbvHcv },
    { key: "fatigue", label: "ク：強い倦怠感・易疲労感（月7日以上）", val: !!c.fatigue },
    { key: "nauseaVomiting", label: "ケ：嘔吐・嘔気（月7日以上）", val: !!c.nauseaVomiting },
    { key: "muscleCramp", label: "コ：有痛性筋けいれん", val: !!c.muscleCramp },
  ];
  const unknownCount = atoKa.filter((i) => i.val == null).length;
  const trueCount = atoKa.filter((i) => i.val === true).length;
  const hasAtoG = atoKa.slice(0, 7).some((i) => i.val === true);

  const missing = [...cp.missing];
  if (unknownCount > 0) missing.push("supplementary");

  if (cp.total == null) {
    return { grade: null, insufficient: true, missing, cp, atoKa, trueCount };
  }
  if (cp.total < 7) {
    return { grade: 0, cp, atoKa, trueCount, missing, reasonShort: "Child-Pugh分類の合計点数が7点未満のため、認定基準に該当しません。" };
  }

  let grade = 0;
  if (cp.threeItemRule && trueCount >= 5) grade = 1;
  else if (cp.threeItemRule && trueCount >= 3 && hasAtoG) grade = 2;
  else if (trueCount >= 3 && hasAtoG) grade = 3;
  else if (trueCount >= 1) grade = 4;

  return { grade, cp, atoKa, trueCount, missing, unknownCount };
}

// ---------- 障害年金（肝疾患）等級計算 ----------
function pensionCategory(key, v) {
  if (v == null) return null;
  switch (key) {
    case "bilirubin":
      return v > 3.0 ? "high" : v >= 2.0 ? "moderate" : "normal";
    case "albumin":
      return v < 3.0 ? "high" : v <= 3.5 ? "moderate" : "normal";
    case "platelet":
      return v < 5 ? "high" : v < 10 ? "moderate" : "normal";
    case "pt":
      return v < 40 ? "high" : v <= 70 ? "moderate" : "normal";
    case "ascites":
      return v === "severe" ? "high" : v === "mild" ? "moderate" : "normal";
    case "encephalopathy":
      return v === "3plus" || v === "2" ? "high" : v === "1" ? "moderate" : "normal";
    default:
      return null;
  }
}

export function calcPensionGrade(c) {
  const numKeys = ["bilirubin", "albumin", "platelet", "pt"];
  const catKeys = ["ascites", "encephalopathy"];
  const categories = {};
  let known = 0;
  for (const k of numKeys) {
    const cat = pensionCategory(k, numOrNull(c[k]));
    categories[k] = cat;
    if (cat != null) known++;
  }
  for (const k of catKeys) {
    const cat = pensionCategory(k, c[k]);
    categories[k] = cat;
    if (cat != null) known++;
  }

  const moderate = Object.values(categories).filter((v) => v === "moderate").length;
  const highCount = Object.values(categories).filter((v) => v === "high").length;
  const moderateOrHigh = moderate + highCount;
  const gs = c.generalStatus;

  if (known === 0 || !gs) {
    return { grade: null, insufficient: true, categories, moderateOrHigh, highCount, generalStatus: gs, known };
  }

  let grade = 0;
  if ((highCount >= 3 || (highCount >= 2 && moderate >= 2)) && gs === "o") grade = 1;
  else if (moderateOrHigh >= 3 && (gs === "e" || gs === "u")) grade = 2;
  else if (moderateOrHigh >= 2 && (gs === "u" || gs === "i")) grade = 3;

  return { grade, categories, moderateOrHigh, highCount, generalStatus: gs, known };
}

// ---------- 指定難病（肝疾患関連6疾病）病名・重症度分類の基準文（SeverityConfirmStepでの医師確認案内にも使用） ----------
export const DESIGNATED_DISEASE_INFO = {
  pbc: {
    disease: "原発性胆汁性胆管炎（PBC）",
    criteria: "重症度分類：症候性PBC（黄疸・皮膚掻痒感・食道胃静脈瘤・腹水・肝性脳症のいずれかを有する）が対象。無症候性PBCは対象外。",
  },
  psc: {
    disease: "原発性硬化性胆管炎（PSC）",
    criteria: "重症度分類：有症状（黄疸・皮膚掻痒・胆管炎・腹水・消化管出血・肝性脳症・胆管癌等）、またはALPが施設基準値上限の2倍以上のいずれかで対象。",
  },
  aih: {
    disease: "自己免疫性肝炎",
    criteria: "重症度分類：自己免疫性肝炎診療ガイドライン中等症以上（臨床所見：肝性脳症・肝萎縮／検査所見：AST orALT>200、総Bil>5mg/dL、PT-INR≧1.3）、または肝硬変の診断のいずれかで対象。",
  },
  wilson: {
    disease: "ウィルソン病",
    criteria: "重症度分類：肝障害はChild-Pugh分類B・C（7点以上）、神経障害等はmRS等いずれかが3以上、腎障害はCKD重症度分類ヒートマップ赤の部分、のいずれかで対象（本ツールは肝障害パスのみ判定）。",
  },
  budd_chiari: {
    disease: "バッド・キアリ症候群",
    criteria: "重症度分類：門脈血行異常症の診断と治療のガイドラインにおける5因子（食道・胃・異所性静脈瘤、門脈圧亢進所見、身体活動制限、消化管出血、肝不全）のうち最も重いものによる重症度Ⅲ度以上が対象。",
  },
  portal_hypertension: {
    disease: "特発性門脈圧亢進症",
    criteria: "重症度分類：門脈血行異常症の診断と治療のガイドラインにおける5因子（食道・胃・異所性静脈瘤、門脈圧亢進所見、身体活動制限、消化管出血、肝不全）のうち最も重いものによる重症度Ⅲ度以上が対象。",
  },
};

// 医師に電話で重症度基準への該当を直接確認した場合、その回答を臨床値からの自動計算より優先する。
// 「難病の情報提供をSWに依頼した時点で、医師の中では数値的な該当は済んでいると考えられる」というユーザーの実務感覚に基づく。
function applyDoctorOverride(result, answers) {
  const doctorAnswer = answers.doctorSeverity?.[result.id];
  if (doctorAnswer !== "eligible" && doctorAnswer !== "mild") return result;
  if (doctorAnswer === "eligible") {
    return {
      ...result,
      eligible: true,
      tier: "eligible",
      doctorConfirmed: true,
      detail: "医師に電話で確認したところ、重症度基準に「該当する」との回答がありました。",
    };
  }
  return {
    ...result,
    eligible: false,
    tier: "mild",
    doctorConfirmed: true,
    detail: "医師に電話で確認したところ、重症度基準に「該当しない」との回答がありました。",
  };
}

// ---------- 指定難病（肝疾患関連6疾病）該当判定 ----------
// tier: 'severe' | 'eligible' | 'moderate' | 'mild' | 'insufficient'
//   信号表示（🟢🟡🔴）に使う共通の重みづけ。severe/eligible→🟢、moderate/insufficient→🟡、mild→🔴
export function evalDesignatedDiseases(answers, c) {
  const results = [];

  if (has(answers.diagnosis, "pbc")) {
    const symptomatic = !!(c.jaundice || c.pruritus || c.varicesPresent || c.ascites === "mild" || c.ascites === "severe" || (c.encephalopathy && c.encephalopathy !== "none"));
    const bil = numOrNull(c.bilirubin);
    const stage = bil == null ? "" : bil >= 2.0 ? "（s2：総ビリルビン2.0mg/dL以上）" : "（s1：総ビリルビン2.0mg/dL未満）";
    results.push({
      id: "pbc",
      disease: DESIGNATED_DISEASE_INFO.pbc.disease,
      eligible: symptomatic,
      tier: symptomatic ? "eligible" : "mild",
      detail: symptomatic
        ? `症候性PBCに該当する所見（黄疸・皮膚掻痒感・食道胃静脈瘤・腹水・肝性脳症のいずれか）があります${stage}。`
        : "無症候性PBC（黄疸・皮膚掻痒感・静脈瘤・腹水・肝性脳症のいずれも認めない）は原則対象外です。症状が出現した場合に再検討してください。",
      criteria: DESIGNATED_DISEASE_INFO.pbc.criteria,
    });
  }

  if (has(answers.diagnosis, "psc")) {
    const symptomatic = !!(c.jaundice || c.pruritus || c.cholangitis || c.ascites === "mild" || c.ascites === "severe" || c.giBleeding || (c.encephalopathy && c.encephalopathy !== "none") || c.cholangiocarcinoma);
    const alpHigh = c.alpRatio === "high";
    const eligible = symptomatic || alpHigh;
    results.push({
      id: "psc",
      disease: DESIGNATED_DISEASE_INFO.psc.disease,
      eligible,
      tier: eligible ? "eligible" : "mild",
      detail: eligible
        ? `${symptomatic ? "有症状（黄疸・皮膚掻痒・胆管炎・腹水・消化管出血・肝性脳症・胆管癌のいずれか）に該当します。" : ""}${alpHigh ? "ALPが施設基準値上限の2倍以上です。" : ""}`
        : "有症状の所見がなく、ALP値も基準上限の2倍未満（または未確認）です。ALP値をご確認のうえ再度判定してください。",
      criteria: DESIGNATED_DISEASE_INFO.psc.criteria,
    });
  }

  if (has(answers.diagnosis, "aih")) {
    const ptInr = numOrNull(c.ptInr);
    const ast = numOrNull(c.ast);
    const alt = numOrNull(c.alt);
    const bil = numOrNull(c.bilirubin);
    const severe = !!((c.encephalopathy && c.encephalopathy !== "none") || c.liverAtrophy || (ptInr != null && ptInr >= 1.3));
    const moderate = !severe && !!((ast != null && ast > 200) || (alt != null && alt > 200) || (bil != null && bil > 5));
    const cirrhosisDiagnosed = has(answers.diagnosis, "cirrhosis_decompensated") || has(answers.diagnosis, "cirrhosis_compensated");
    const eligible = severe || moderate || cirrhosisDiagnosed;
    results.push({
      id: "aih",
      disease: DESIGNATED_DISEASE_INFO.aih.disease,
      eligible,
      tier: severe || cirrhosisDiagnosed ? "severe" : moderate ? "moderate" : "mild",
      detail: eligible
        ? `${severe ? "重症相当（肝性脳症・肝萎縮・PT-INR1.3以上のいずれか）です。" : moderate ? "中等症相当（AST/ALT>200、総ビリルビン>5mg/dLのいずれか）です。" : ""}${cirrhosisDiagnosed ? "肝硬変の診断があります。" : ""}`
        : "軽症相当（臨床所見・検査所見のいずれも認めない）です。経過観察のうえ、悪化時に再度判定してください。",
      criteria: DESIGNATED_DISEASE_INFO.aih.criteria,
    });
  }

  if (has(answers.diagnosis, "wilson")) {
    const cp = calcChildPugh(c);
    const eligible = cp.total != null ? cp.total >= 7 : null;
    results.push({
      id: "wilson",
      disease: DESIGNATED_DISEASE_INFO.wilson.disease,
      eligible: eligible === true,
      tier: eligible === true ? "eligible" : eligible === false ? "mild" : "insufficient",
      insufficient: eligible == null,
      detail: eligible === true
        ? `Child-Pugh分類の合計点数が${cp.total}点（B〜C相当、7点以上）のため、肝障害による重症度基準を満たします。`
        : eligible === false
          ? `Child-Pugh分類の合計点数が${cp.total}点で、肝障害による基準（7点以上）を満たしません。神経症状・腎機能障害による重症度基準（mRS等）は本ツールでは判定していないため、該当する場合は難病情報センターの基準をご確認ください。`
          : "肝障害による重症度判定にはChild-Pugh分類に必要な検査値の入力が必要です。神経症状・腎機能障害による基準（mRS・CKD重症度等）は本ツール対象外のため、別途ご確認ください。",
      criteria: DESIGNATED_DISEASE_INFO.wilson.criteria,
    });
  }

  if (has(answers.diagnosis, "budd_chiari") || has(answers.diagnosis, "portal_hypertension")) {
    const ph = calcPortalHypertensionStage(c);
    const eligible = ph.stage >= 3;
    const id = has(answers.diagnosis, "budd_chiari") ? "budd_chiari" : "portal_hypertension";
    results.push({
      id,
      disease: DESIGNATED_DISEASE_INFO[id].disease,
      eligible,
      tier: eligible ? "eligible" : "mild",
      detail: `5因子（食道・胃・異所性静脈瘤、門脈圧亢進所見、身体活動制限、消化管出血、肝不全）のうち最も重い所見から、重症度分類は${ph.roman}度相当です。${eligible ? "Ⅲ度以上のため対象です。" : "Ⅲ度未満のため、現時点の回答では原則対象外です。"}`,
      criteria: DESIGNATED_DISEASE_INFO[id].criteria,
    });
  }

  const overridden = results.map((r) => applyDoctorOverride(r, answers));

  // ---------- 軽症者特例 ----------
  // 重症度基準を満たさない（＝軽症、専門的評価待ちの「情報不足」は除く）場合でも、
  // (1)直近12か月に医療費総額（10割相当）が33,330円を超えた月が3回以上ある、
  // (2)今後、高額な医薬品（分子標的薬・生物学的製剤等）による治療開始を予定している、
  // のいずれかに該当すれば、指定難病医療費助成の対象になる（難病法上の軽症者特例）。
  // 医師が「該当しない」と回答した場合も、軽症であることに変わりはないためこの特例の対象になり得る。
  const highCostMonths = numOrNull(c.highCostMonths) ?? 0;
  const plannedHighCostDrug = !!c.plannedHighCostDrug;
  if (highCostMonths >= 3 || plannedHighCostDrug) {
    return overridden.map((r) => {
      if (r.eligible || r.insufficient) return r;
      const note = plannedHighCostDrug
        ? "今後、高額な医薬品による治療開始を予定しているとの回答から"
        : `直近12か月で医療費総額（10割相当）が33,330円を超えた月が${highCostMonths}回あるとの回答から`;
      return {
        ...r,
        eligible: true,
        tier: "eligible",
        mildException: true,
        detail: `${r.detail}<br>${note}、重症度基準を満たさなくても「軽症者特例」により医療費助成の対象となる可能性があります。`,
      };
    });
  }

  return overridden;
}

// ---------- その他の制度（社会保障の一覧） ----------
export const RULES = [
  {
    id: "hepatitis_subsidy",
    name: "肝炎医療費助成（インターフェロン・核酸アナログ製剤・DAA治療）",
    category: "医療費助成",
    match: (a) => {
      if (has(a.treatment, "antiviral_completed")) return false;
      return has(a.diagnosis, "hbv") || has(a.diagnosis, "hcv");
    },
    summary: "B型・C型肝炎の抗ウイルス治療にかかる医療費の自己負担限度額が、月1万円または2万円に軽減されます（所得要件あり）。",
    requirements: [
      "B型肝炎の核酸アナログ製剤治療、C型肝炎のDAA治療、またはインターフェロン治療を受けていること（これから治療を始める場合も対象になります）",
      "神奈川県内に住所があること（世帯の課税状況により自己負担限度額が異なります）",
      "認定には原則1年ごとの更新申請が必要です",
    ],
    reason: (a) => {
      const t = [];
      if (has(a.treatment, "na_therapy")) t.push("核酸アナログ製剤治療");
      if (has(a.treatment, "daa_therapy")) t.push("DAA治療");
      if (has(a.treatment, "ifn_therapy")) t.push("インターフェロン治療");
      if (t.length > 0) return `${t.join("・")}を受けているとの回答から、肝炎医療費助成の対象となる可能性があります。`;
      return "B型・C型肝炎の診断があるとの回答から、治療を開始する場合に肝炎医療費助成の対象となる可能性があります。";
    },
    offices: (a) => {
      if (a.residence === "outside") return [{ name: "お住まいの都道府県の担当窓口" }];
      return [{
        ...KANAGAWA_DISEASE_CONTROL,
        note: a.residence === "kawasaki"
          ? "神奈川県の制度で、川崎市専用の窓口ではありません。最寄りの保健所でも手続きできる場合があるため、政令指定都市在住である旨を伝えてご確認ください。"
          : "手続きは、お住まいを管轄する保健所でも行えます。",
      }];
    },
  },
  {
    id: "cancer_cirrhosis",
    name: "肝がん・重度肝硬変治療研究促進事業",
    category: "医療費助成",
    match: (a) =>
      has(a.diagnosis, "liver_cancer") ||
      (has(a.diagnosis, "cirrhosis_decompensated") && (has(a.diagnosis, "hbv") || has(a.diagnosis, "hcv"))),
    summary: "肝炎ウイルスの持続感染が原因の肝がん・重度肝硬変（Child-Pugh C相当）の入院医療費について、自己負担限度額が軽減されます（所得要件あり）。",
    requirements: [
      "B型・C型肝炎ウイルスの持続感染が原因の肝がん、または重度肝硬変（Child-Pugh分類C）であること",
      "所得要件があります（世帯の市町村民税課税年額により対象外となる場合があります）",
      "指定医療機関での入院治療が対象です",
    ],
    reason: (a) => {
      if (has(a.diagnosis, "liver_cancer")) return "「肝がん（肝炎ウイルスが原因）」の回答があるため、対象となる可能性があります。";
      return "「肝硬変（非代償期）」とB型またはC型肝炎の回答があるため、重度肝硬変として対象となる可能性があります（Child-Pugh分類による確認が必要です）。";
    },
    offices: (a) => {
      if (a.residence === "outside") return [{ name: "お住まいの都道府県の担当窓口" }];
      return [{
        ...KANAGAWA_DISEASE_CONTROL,
        note: "申請書類は保健所等では受け付けておらず、神奈川県健康医療局へ直接郵送する必要があります。",
      }];
    },
  },
  {
    id: "free_test",
    name: "肝炎ウイルス無料検査",
    category: "検診",
    match: (a) => a.screening === "never_tested",
    summary: "保健所や委託医療機関で、B型・C型肝炎ウイルス検査を無料で受けられる制度です。",
    requirements: [
      "多くの自治体で、過去に受診歴がない方を対象としています",
      "特定健診等と同時に受けられる場合があります",
    ],
    reason: () => "肝炎ウイルス検査を受けたことがないとの回答から、無料検査の利用をご案内できます。",
    extraNote: (a) => MUNICIPALITIES[a.residence]?.screeningNote,
    offices: (a) => {
      if (a.residence === "kawasaki") {
        return [{ name: "川崎市健康福祉局 保健医療政策部 感染症対策課", phone: "044-200-2441" }];
      }
      return [{ name: MUNICIPALITIES[a.residence].offices.hepatitisTest }];
    },
  },
  {
    id: "followup",
    name: "肝炎ウイルス陽性者フォローアップ事業",
    category: "検診",
    match: (a) => {
      if (has(a.treatment, "antiviral_completed")) return false;
      return (has(a.diagnosis, "hbv") || has(a.diagnosis, "hcv")) && has(a.treatment, "no_treatment");
    },
    summary: "肝炎ウイルス陽性であるものの定期受診に結びついていない方に、受診を勧奨し、必要な検査費用等を助成する事業です。",
    requirements: [
      "B型・C型肝炎ウイルス陽性で、現在治療を受けていない、または定期的な受診をしていないこと",
      "自治体によって実施の有無・助成内容が異なります",
    ],
    reason: () => "肝炎ウイルスの診断があり、現在治療を受けていないとの回答から、受診につなげるための事業をご案内できます。",
    offices: (a) => {
      if (a.residence === "kawasaki") {
        return [{ name: "川崎市健康福祉局 保健医療政策部 感染症対策課", phone: "044-200-2441" }];
      }
      return [{ name: MUNICIPALITIES[a.residence].offices.hepatitisTest }];
    },
  },
  {
    id: "high_cost",
    name: "高額療養費制度",
    category: "医療費",
    match: () => true,
    summary: "医療機関や薬局の窓口で支払う医療費が、ひと月の自己負担限度額（所得区分により異なる）を超えた場合に、超えた分が払い戻される制度です。",
    requirements: [
      "加入している医療保険（健康保険組合、協会けんぽ、国民健康保険 等）に申請します",
      "事前に「限度額適用認定証」の交付を受けておくと、窓口での支払いを自己負担限度額までに抑えられます",
      "他の医療費助成制度と併用できる場合が多く、あわせて確認するとよい制度です",
    ],
    reason: () => "医療費の自己負担が発生する治療全般に関わる、基礎的な制度としてご案内します。",
    offices: () => [{ name: "加入している医療保険者（健康保険組合、協会けんぽ、国民健康保険の窓口 等）" }],
    baseline: true,
  },
];

// ---------- 窓口情報（手帳・年金・指定難病） ----------
export function handbookOffice(answers) {
  const w = kawasakiWard(answers);
  if (w) return { name: `${w.label}役所 高齢・障害課（障害者支援係）`, phone: w.disabilityPhone };
  return { name: MUNICIPALITIES[answers.residence]?.offices.disabilityHandbook || "お住まいの市区町村 障害福祉担当課" };
}

export function pensionOffice(answers) {
  const w = kawasakiWard(answers);
  if (w) return PENSION_OFFICES[w.pensionOffice];
  return { name: "年金事務所、または街角の年金相談センター（日本年金機構）" };
}

export function designatedDiseaseOffices(answers) {
  const w = kawasakiWard(answers);
  if (answers.residence === "kawasaki") {
    return [
      { label: "制度の相談", name: "川崎市 指定難病医療費助成コールセンター", phone: "044-200-1979", note: "平日9:00〜17:00" },
      ...(w ? [{ label: "申請窓口", name: `${w.label}役所 保健福祉センター`, phone: w.diseasePhone }] : []),
    ];
  }
  return [{ name: MUNICIPALITIES[answers.residence]?.offices.designatedDisease || "お住まいを管轄する保健所" }];
}
