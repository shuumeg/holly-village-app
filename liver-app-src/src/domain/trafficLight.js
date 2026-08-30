/* ==========================================================
   判定結果を🟢🟡🔴の3段階に単純化するための変換ロジック。
   厳密な等級とは別に「面談ですぐ説明できる一目でわかる目安」を作る。
   ========================================================== */

import { GRADE_LABEL } from "./constants";

export function handbookTrafficLight(hb) {
  if (hb.insufficient) {
    return { emoji: "🟡", level: "caution", text: "情報不足のため判定できません（血液検査値の入力で判定できます）" };
  }
  if (hb.grade === 1 && hb.reason) {
    return { emoji: "🟢", level: "high", text: "1級に該当する可能性が高いです（肝臓移植後・抗免疫療法継続中）" };
  }
  if (hb.grade === 0) {
    return { emoji: "🔴", level: "low", text: hb.reasonShort || "現状の数値では非該当の可能性が高いです" };
  }
  if (hb.grade === 1 || hb.grade === 2) {
    return { emoji: "🟢", level: "high", text: `${GRADE_LABEL[hb.grade]}相当・該当の可能性が高いです` };
  }
  return { emoji: "🟡", level: "caution", text: `${GRADE_LABEL[hb.grade]}相当・ギリギリのラインです（医師に要確認）` };
}

export function pensionTrafficLight(pension) {
  if (pension.insufficient) {
    return { emoji: "🟡", level: "caution", text: "情報不足のため判定できません（血液検査値と一般状態区分の入力が必要です）" };
  }
  if (pension.grade === 0) {
    return { emoji: "🔴", level: "low", text: "現状の日常生活能力・検査値では非該当の可能性が高いです" };
  }
  if (pension.grade === 1) {
    return { emoji: "🟢", level: "high", text: "1級相当・該当の可能性が高いです" };
  }
  return { emoji: "🟡", level: "caution", text: `${GRADE_LABEL[pension.grade]}相当・ギリギリのラインです（初診日・保険料納付要件は別途確認）` };
}

export function ruleTrafficLight(matched) {
  return matched
    ? { emoji: "🟢", level: "high", text: "対象の可能性が高いです" }
    : { emoji: "🔴", level: "low", text: "現時点では対象外の可能性が高いです" };
}

export function diseaseTrafficLight(d) {
  if (d.tier === "insufficient") {
    return { emoji: "🟡", level: "caution", text: "情報不足、または専門的な評価が必要です" };
  }
  if (d.mildException) {
    return { emoji: "🟢", level: "high", text: "該当の可能性が高いです（軽症者特例）" };
  }
  if (d.tier === "severe" || d.tier === "eligible") {
    return { emoji: "🟢", level: "high", text: "該当の可能性が高いです（重症度基準クリア）" };
  }
  if (d.tier === "moderate") {
    return { emoji: "🟡", level: "caution", text: "中等症相当・ギリギリのラインです（医師に要確認）" };
  }
  return { emoji: "🔴", level: "low", text: "軽症相当・現時点では非該当の可能性が高いです" };
}
