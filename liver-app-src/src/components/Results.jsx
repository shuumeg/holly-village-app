import { useMemo } from "react";
import {
  calcHandbookGrade, calcPensionGrade, evalDesignatedDiseases,
  handbookOffice, pensionOffice, designatedDiseaseOffices,
  currentHbvHcv, cpLabel, RULES, has, cancerCirrhosisIncomeEligible,
} from "../domain/calculations";
import { handbookTrafficLight, pensionTrafficLight, diseaseTrafficLight, ruleTrafficLight } from "../domain/trafficLight";
import { GRADE_LABEL, GENERAL_STATUS_OPTIONS } from "../domain/constants";
import TrafficLightSummary from "./TrafficLightSummary";
import PreciseCard from "./PreciseCard";
import RuleCard from "./RuleCard";
import IncomeEligibilityFields from "./IncomeEligibilityFields";

function generalStatusShort(id) {
  return GENERAL_STATUS_OPTIONS.find((o) => o.id === id)?.label.slice(0, 1) ?? "未回答";
}

// 「くわしい判定結果」もサマリーと同じく、対象の可能性が高いもの（緑）から順に並べる
const STATUS_ORDER = { "status-yes": 0, "status-unknown": 1, "status-no": 2 };

export default function Results({ answers, clinical, setClinical }) {
  const setClinicalField = (key, val) => setClinical((prev) => ({ ...prev, [key]: val }));
  const c = useMemo(() => ({ ...clinical, currentHbvHcv: currentHbvHcv(answers) }), [clinical, answers]);

  const hb = useMemo(() => calcHandbookGrade(c), [c]);
  const pension = useMemo(() => calcPensionGrade(c), [c]);
  const diseases = useMemo(() => evalDesignatedDiseases(answers, c), [answers, c]);

  const hbOffice = handbookOffice(answers);
  const pensOffice = pensionOffice(answers);
  const diseaseOffices = designatedDiseaseOffices(answers);

  // 個別に判定・表示するRULES（信号表示＋くわしい判定結果を持つため、下の候補一覧からは除外する）
  const subsidyRule = RULES.find((r) => r.id === "hepatitis_subsidy");
  const cancerRule = RULES.find((r) => r.id === "cancer_cirrhosis");
  const hasVirus = has(answers.diagnosis, "hbv") || has(answers.diagnosis, "hcv");
  const cancerCirrhosisRelevant = has(answers.diagnosis, "liver_cancer") || has(answers.diagnosis, "cirrhosis_decompensated");
  const subsidyMatched = hasVirus && subsidyRule.match(answers);
  const cancerCauseMatched = cancerCirrhosisRelevant && cancerRule.match(answers);
  const cancerIncomeEligible = cancerCirrhosisIncomeEligible(c);
  const cancerInsufficient = cancerCauseMatched && cancerIncomeEligible === null;
  const cancerMatched = cancerCauseMatched && cancerIncomeEligible === true;
  const EXTRACTED_RULE_IDS = ["hepatitis_subsidy", "cancer_cirrhosis"];

  const trafficItems = [
    { key: "handbook", name: "身体障害者手帳（肝臓機能障害）", light: handbookTrafficLight(hb) },
    { key: "pension", name: "障害年金（肝疾患）", light: pensionTrafficLight(pension) },
    ...diseases.map((d) => ({ key: `disease-${d.id}`, name: `指定難病（${d.disease}）`, light: diseaseTrafficLight(d) })),
    ...(hasVirus ? [{ key: "hepatitis_subsidy", name: "肝炎医療費助成", light: ruleTrafficLight(subsidyMatched) }] : []),
    ...(cancerCirrhosisRelevant ? [{ key: "cancer_cirrhosis", name: "肝がん・重度肝硬変治療研究促進事業", light: ruleTrafficLight(cancerMatched, cancerInsufficient) }] : []),
  ];

  const matched = RULES.filter((rule) => !EXTRACTED_RULE_IDS.includes(rule.id) && rule.match(answers));
  const candidates = matched.filter((r) => !r.baseline);
  const baseline = matched.filter((r) => r.baseline);

  // --- 身体障害者手帳カードの本文 ---
  let handbookBody;
  if (hb.insufficient) {
    handbookBody = `Child-Pugh分類の判定に必要な検査値（${hb.missing.filter((m) => m !== "supplementary").map(cpLabel).join("・")}）が不足しています。臨床検査値を入力すると判定できます。`;
  } else if (hb.grade === 1 && hb.reason) {
    handbookBody = hb.reason;
  } else if (hb.grade >= 1) {
    const missingNote = hb.unknownCount > 0 ? `（ア〜コの補完項目のうち${hb.unknownCount}項目が未入力です。入力により等級が変わる可能性があります）` : "";
    handbookBody = `Child-Pugh分類の合計点数は${hb.cp.total}点、ア〜コの該当項目数は${hb.trueCount}個です。${missingNote}90日以上180日以内隔てた2回連続の検査で同じ状態が確認されることが正式な認定の条件です（${c.twoExamsConfirmed ? "確認済みとの回答です" : "未確認との回答、または未回答です"}）。`;
  } else {
    handbookBody = hb.reasonShort || `Child-Pugh分類の合計点数は${hb.cp.total}点、ア〜コの該当項目数は${hb.trueCount}個で、いずれの等級基準も満たしません。`;
  }

  // --- 障害年金カードの本文 ---
  let pensionBody;
  if (pension.insufficient) {
    pensionBody = "血液検査値・腹水・脳症のいずれかと、一般状態区分（ア〜オ）の入力が必要です。";
  } else if (pension.grade >= 1) {
    const knownNote = pension.known < 6 ? `（6項目中${pension.known}項目のみ評価。未入力の項目は集計に含まれていないため、入力により該当項目数が増える可能性があります）` : "";
    pensionBody = `検査項目のうち中等度以上の異常が${pension.moderateOrHigh}項目（うち高度異常${pension.highCount}項目）${knownNote}、一般状態区分は「${generalStatusShort(pension.generalStatus)}」です。初診日における年金制度の加入状況・保険料納付要件は別途確認が必要です。`;
  } else {
    const knownNote = pension.known < 6 ? `（6項目中${pension.known}項目のみ評価）` : "";
    pensionBody = `検査項目のうち中等度以上の異常は${pension.moderateOrHigh}項目${knownNote}、一般状態区分は「${generalStatusShort(pension.generalStatus)}」で、いずれの等級基準も満たしません。`;
  }

  return (
    <div className="results">
      <div className="disclaimer-box">
        このツールは入力内容から等級・該当可否の目安を計算するものです。実際の認定は指定医の診断書・意見書、および審査機関（川崎市障害程度審査委員会、日本年金機構、難病医療費助成の審査会等）の判断によります。掲載の判定基準・電話番号は2026年8月時点で確認したものです。
      </div>

      {answers.diagnosisLabel && (
        <p className="results-target">
          対象疾患：{answers.diagnosisLabel}
          {has(answers.diagnosis, "hbv") && "（B型肝炎の感染あり）"}
          {has(answers.diagnosis, "hcv") && "（C型肝炎の感染あり）"}
        </p>
      )}

      <h3 className="results-subheading">ひと目でわかる判定サマリー</h3>
      <TrafficLightSummary items={trafficItems} />

      <h3 className="results-subheading">くわしい判定結果</h3>
      {[
        {
          key: "handbook",
          name: "身体障害者手帳（肝臓機能障害）",
          status: hb.insufficient ? "情報不足" : hb.grade === 1 && hb.reason ? "1級に該当する可能性" : hb.grade >= 1 ? `${GRADE_LABEL[hb.grade]}相当の可能性` : "現時点では非該当",
          statusClass: hb.insufficient ? "status-unknown" : hb.grade >= 1 ? "status-yes" : "status-no",
          body: handbookBody,
          offices: [hbOffice],
        },
        {
          key: "pension",
          name: "障害年金（肝疾患）",
          status: pension.insufficient ? "情報不足" : pension.grade >= 1 ? `${GRADE_LABEL[pension.grade]}相当の可能性` : "現時点では非該当",
          statusClass: pension.insufficient ? "status-unknown" : pension.grade >= 1 ? "status-yes" : "status-no",
          body: pensionBody,
          offices: [pensOffice],
        },
        ...diseases.map((d) => ({
          key: `disease-${d.id}`,
          name: `指定難病医療費助成（${d.disease}）`,
          status: d.insufficient ? "情報不足／専門的評価が必要" : d.eligible ? "対象の可能性" : "現時点では非該当",
          statusClass: d.insufficient ? "status-unknown" : d.eligible ? "status-yes" : "status-no",
          body: `${d.detail}<br><span class="result-card__criteria">判定基準：${d.criteria}</span>`,
          offices: diseaseOffices,
        })),
        ...(hasVirus ? [{
          key: "hepatitis_subsidy",
          name: subsidyRule.name,
          status: subsidyMatched ? "対象の可能性" : "現時点では対象外",
          statusClass: subsidyMatched ? "status-yes" : "status-no",
          body: subsidyMatched
            ? `${subsidyRule.reason(answers)}<br><span class="result-card__criteria">${subsidyRule.summary}</span>`
            : "「治療済み（治療は終了）」との回答のため、現時点では対象外です。",
          offices: subsidyRule.offices(answers),
        }] : []),
        ...(cancerCirrhosisRelevant ? [{
          key: "cancer_cirrhosis",
          name: cancerRule.name,
          status: cancerInsufficient ? "情報不足" : cancerMatched ? "対象の可能性" : "現時点では対象外",
          statusClass: cancerInsufficient ? "status-unknown" : cancerMatched ? "status-yes" : "status-no",
          body: cancerInsufficient
            ? `${cancerRule.reason(answers)}<br>所得要件（年収目安約370万円以下）の確認に必要な年齢・所得区分（自己負担割合）が未入力のため、対象可否を判定できません。`
            : cancerMatched
            ? `${cancerRule.reason(answers)}<br><span class="result-card__criteria">${cancerRule.summary}</span>`
            : cancerCauseMatched
            ? `${cancerRule.reason(answers)}<br>所得区分（年収目安約370万円超）から、現時点では所得要件を満たさない可能性があります。`
            : "B型・C型肝炎ウイルスの感染の合併が確認できないため、現時点では対象外です。",
          offices: cancerRule.offices(answers),
          children: cancerCauseMatched && (
            <div className="result-card__inline-form">
              <p className="qstep__hint">所得区分を入力・変更すると、この場で判定し直せます。</p>
              <IncomeEligibilityFields clinical={clinical} setClinicalField={setClinicalField} />
            </div>
          ),
        }] : []),
      ]
        .sort((a, b) => STATUS_ORDER[a.statusClass] - STATUS_ORDER[b.statusClass])
        .map(({ key, ...card }) => <PreciseCard key={key} {...card} />)}

      <h3 className="results-subheading">その他の候補となりうる制度</h3>
      {candidates.length > 0 ? (
        candidates.map((rule) => <RuleCard key={rule.id} rule={rule} answers={answers} />)
      ) : (
        <p className="results-empty">今回の回答からは、該当しそうな制度の候補が見つかりませんでした。</p>
      )}

      {baseline.length > 0 && (
        <>
          <h3 className="results-subheading">あわせて確認したい制度</h3>
          {baseline.map((rule) => <RuleCard key={rule.id} rule={rule} answers={answers} />)}
        </>
      )}
    </div>
  );
}
