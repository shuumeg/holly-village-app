/* ==========================================================
   肝疾患の社会保障判定 - 定数・選択肢データ
   判定基準の出典は domain/calculations.js の先頭コメントを参照。
   ========================================================== */

export const TREATMENT_OPTIONS = [
  { id: "na_therapy", label: "B型肝炎：核酸アナログ製剤による治療中" },
  { id: "daa_therapy", label: "C型肝炎：直接作用型抗ウイルス薬（DAA）による治療中" },
  { id: "ifn_therapy", label: "インターフェロン治療中" },
  { id: "antiviral_completed", label: "DAA・インターフェロン治療済み（治療は終了）" },
  { id: "no_treatment", label: "現在、上記の治療は受けていない／わからない" },
];

export const NUMBER_FIELDS = [
  { key: "bilirubin", label: "血清総ビリルビン値", unit: "mg/dL", step: "0.1" },
  { key: "albumin", label: "血清アルブミン値", unit: "g/dL", step: "0.1" },
  { key: "pt", label: "プロトロンビン時間（PT）", unit: "%", step: "1" },
  { key: "ptInr", label: "プロトロンビン時間（PT-INR）", unit: "", step: "0.01" },
  { key: "platelet", label: "血小板数", unit: "万/μL", step: "0.1" },
  { key: "ast", label: "AST（GOT）", unit: "U/L", step: "1" },
  { key: "alt", label: "ALT（GPT）", unit: "U/L", step: "1" },
  { key: "ammonia", label: "血中アンモニア濃度", unit: "μg/dL", step: "1" },
];

export const ASCITES_OPTIONS = [
  { id: "none", label: "なし" },
  { id: "mild", label: "あり（利尿剤等でコントロール可能）" },
  { id: "severe", label: "難治性腹水（コントロール困難）" },
];

export const ENCEPHALOPATHY_OPTIONS = [
  { id: "none", label: "なし（症状なし）" },
  { id: "1", label: "Ⅰ度（睡眠リズムの逆転、多幸感やうつ状態、だらしない態度など。後から振り返って分かる程度の軽い症状）" },
  { id: "2", label: "Ⅱ度（時間・場所が分からなくなる、お金をまく等の異常行動、羽ばたき振戦。呼びかければ会話はできる）" },
  { id: "3plus", label: "Ⅲ度以上（もうろう状態〜完全な意識消失。外的刺激がないと開眼しない、または簡単な命令にしか応じない〜まったく反応しない）" },
];

export const GENERAL_STATUS_OPTIONS = [
  { id: "a", label: "ア：無症状で社会活動ができ、制限を受けることなく、発病前と同等にふるまえる" },
  { id: "i", label: "イ：軽度の症状があり、肉体労働は制限を受けるが、歩行・軽労働や座業はできる（例：軽い家事、事務など）" },
  { id: "u", label: "ウ：歩行や身のまわりのことはできるが、時に少し介助が必要なこともあり、軽労働はできないが、日中の50％以上は起居している" },
  { id: "e", label: "エ：身のまわりのある程度のことはできるが、しばしば介助が必要で、日中の50％以上は就床しており、自力では屋外への外出等がほぼ不可能" },
  { id: "o", label: "オ：身のまわりのこともできず、常に介助を必要とし、終日就床を強いられ、活動の範囲がおおむねベッド周辺に限られる" },
];

export const LABOR_STATUS_OPTIONS = [
  { id: "fulltime", label: "フルタイムで働けている" },
  { id: "limited", label: "制限付きで働いている（時短勤務・軽作業への配置転換等）" },
  { id: "unable", label: "働けない（休職・退職等）" },
];

export const CHECK_GROUPS = [
  {
    title: "既往・随伴症状（身体障害者手帳の補完項目、PBC/PSC等の症状判定に使用）",
    items: [
      { key: "hccHistory", label: "原発性肝がんの治療既往" },
      { key: "sbpHistory", label: "特発性細菌性腹膜炎の治療既往" },
      { key: "varicesHistory", label: "胃食道静脈瘤の治療既往" },
      { key: "varicesPresent", label: "現在、食道・胃静脈瘤がある" },
      { key: "fatigue", label: "1日1時間以上の安静臥床を要する強い倦怠感・易疲労感が月7日以上ある" },
      { key: "nauseaVomiting", label: "1日2回以上の嘔吐、または30分以上の嘔気が月7日以上ある" },
      { key: "muscleCramp", label: "有痛性筋けいれんが1日1回以上ある" },
      { key: "jaundice", label: "黄疸がある" },
      { key: "pruritus", label: "皮膚掻痒感がある" },
      { key: "cholangitis", label: "胆管炎がある（既往含む）" },
      { key: "giBleeding", label: "消化管出血がある（活動性・既往）" },
      { key: "cholangiocarcinoma", label: "胆管癌を合併している" },
      { key: "liverAtrophy", label: "肝萎縮がある（画像所見）" },
    ],
  },
  {
    title: "治療・診断の背景",
    items: [
      { key: "noAlcohol180", label: "検査日より前180日以上、アルコールを摂取していない（またはアルコール性ではない）" },
      { key: "activeTreatment", label: "改善の可能性のある積極的治療を実施しており、肝臓移植以外に改善が期待できない" },
      { key: "twoExamsConfirmed", label: "上記の状態が、90日以上180日以内隔てた2回の検査で連続して確認されている" },
    ],
  },
];

// ---------- バッド・キアリ症候群/特発性門脈圧亢進症の重症度分類（5因子） ----------
export const BC_VARIX_OPTIONS = [
  { id: "none", label: "なし" },
  { id: "present", label: "あり（易出血性ではない）" },
  { id: "high_risk", label: "易出血性（F2以上、または発赤所見あり）で、出血の既往はない" },
  { id: "bled", label: "易出血性で、出血の既往もある" },
];

export const BC_PORTAL_SIGN_OPTIONS = [
  { id: "none", label: "なし" },
  { id: "untreated", label: "所見はあるが治療は不要（門脈圧亢進性脾腫・腹水・静脈血・貧血等）" },
  { id: "treated", label: "治療を要する所見がある" },
];

export const BC_ACTIVITY_OPTIONS = [
  { id: "none", label: "制限なし" },
  { id: "mild", label: "活動制限はあるが歩行や身の回りのことはでき、日中の50％以上は起居している" },
  { id: "severe", label: "介助を要し、日中の50％以上は就床している" },
];

export const ALP_RATIO_OPTIONS = [
  { id: "normal", label: "施設基準値上限の2倍未満" },
  { id: "high", label: "施設基準値上限の2倍以上" },
];

export const LIVER_TRANSPLANT_OPTIONS = [
  { id: "ongoing", label: "肝臓移植を実施し、現在も抗免疫療法を継続中" },
  { id: "stable", label: "肝臓移植後1年を超え、抗免疫療法を終了・安定している" },
];

export const SCREENING_OPTIONS = [
  { id: "never_tested", label: "受けたことがない／わからない" },
  { id: "tested", label: "受けたことがある" },
];

export const RESIDENCE_OPTIONS = [
  { id: "kawasaki", label: "川崎市" },
  { id: "kanagawa_other", label: "神奈川県内（川崎市以外）" },
  { id: "tokyo", label: "東京都（町田市・稲城市・多摩市・世田谷区・狛江市）" },
  { id: "outside", label: "それ以外" },
];

// ---------- 自治体データ ----------
// 電話番号は2026年8月時点で川崎市・神奈川県・日本年金機構の公式ページで確認したもの。
// diseasePhone=指定難病医療費助成の申請窓口（区役所地域みまもり支援センター「地域ケア推進課」）
// hepatitisPhone=肝炎医療費助成の申請窓口（同センター内の別部署「衛生課」、電話番号が異なる）
// 出典: 神奈川県「肝炎治療受給者証の交付申請をされる方へ」（r8shinseiannai.pdf、2026年）
export const KAWASAKI_WARDS = {
  kawasaki_ku: { label: "川崎区", disabilityPhone: "044-201-3215", diseasePhone: "044-201-3228", hepatitisPhone: "044-201-3204", pensionOffice: "kawasaki" },
  saiwai: { label: "幸区", disabilityPhone: "044-556-6654", diseasePhone: "044-556-6643", hepatitisPhone: "044-556-6682", pensionOffice: "kawasaki" },
  nakahara: { label: "中原区", disabilityPhone: "044-744-3296", diseasePhone: "044-744-3252", hepatitisPhone: "044-744-3280", pensionOffice: "takatsu" },
  takatsu: { label: "高津区", disabilityPhone: "044-861-3252", diseasePhone: "044-861-3302", hepatitisPhone: "044-861-3321", pensionOffice: "takatsu" },
  miyamae: { label: "宮前区", disabilityPhone: "044-856-3304", diseasePhone: "044-856-3254", hepatitisPhone: "044-856-3265", pensionOffice: "takatsu" },
  tama: { label: "多摩区", disabilityPhone: "044-935-3302", diseasePhone: "044-935-3301", hepatitisPhone: "044-935-3310", pensionOffice: "takatsu" },
  asao: { label: "麻生区", disabilityPhone: "044-965-5159", diseasePhone: "044-965-5156", hepatitisPhone: "044-965-5163", pensionOffice: "takatsu" },
};

export const WARD_OPTIONS = Object.entries(KAWASAKI_WARDS).map(([id, w]) => ({ id, label: w.label }));

// 東京都は、聖マリアンナ医科大学病院に隣接する5市区のみ対応（それ以外は「それ以外」で汎用案内）。
// 手続窓口・電話番号は「肝がん・重度肝硬変医療券の手続窓口一覧（令和8年版）」「難病・肝炎手続窓口
// 一覧（令和8年4月）」（いずれも東京都）による。この5市区は指定難病・肝炎・肝がん重度肝硬変の
// いずれも同一の障害福祉担当窓口が受け付けているため、officeName/phoneを共通で使う。
export const TOKYO_MUNICIPALITIES = {
  machida: { label: "町田市", officeName: "町田市 地域福祉部障がい福祉課福祉係", phone: "042-724-2148" },
  inagi: { label: "稲城市", officeName: "稲城市 福祉部障害福祉課障害福祉係", phone: "042-378-2111", phoneNote: "内線224、226" },
  tama: { label: "多摩市", officeName: "多摩市 健康福祉部障害福祉課障害福祉係", phone: "042-338-6903" },
  setagaya: { label: "世田谷区", officeName: "世田谷区 世田谷総合支所 保健福祉センター 健康づくり課", phone: "03-5432-2893" },
  komae: { label: "狛江市", officeName: "狛江市 福祉保健部高齢障がい課障がい者支援係", phone: "03-3430-1111", phoneNote: "内線2208、2209、2221" },
};

export const TOKYO_MUNICIPALITY_OPTIONS = Object.entries(TOKYO_MUNICIPALITIES).map(([id, w]) => ({ id, label: w.label }));

export const PENSION_OFFICES = {
  kawasaki: { name: "川崎年金事務所", phone: "044-233-0181" },
  takatsu: { name: "高津年金事務所", phone: "044-888-0111" },
};

export const KANAGAWA_DISEASE_CONTROL = {
  name: "神奈川県健康医療局 保健医療部 がん・疾病対策課 疾病対策グループ",
  phone: "045-210-1111",
};

// 肝炎医療費助成（肝炎治療受給者証）の相談専用窓口。出典: 神奈川県「肝炎治療受給者証の
// 交付申請をされる方へ」（r8shinseiannai.pdf、2026年）。
export const KANAGAWA_HEPATITIS_CONTACT = {
  name: "神奈川県がん・疾病対策課 肝疾患担当",
  phone: "045-210-4795",
};

// 「神奈川県内（川崎市以外）」のうち、横浜市18区・相模原市・藤沢市のみ肝炎医療費助成の
// 実際の申請窓口（保健所等）に対応。それ以外の市区町村は選択肢の「その他」で汎用案内する。
// 出典: 神奈川県「肝炎治療受給者証の交付申請をされる方へ」（r8shinseiannai.pdf、2026年）。
export const KANAGAWA_OTHER_AREAS = {
  yokohama_tsurumi: { label: "横浜市 鶴見区", officeName: "鶴見福祉保健センター（区役所）", phone: "045-510-1832" },
  yokohama_kanagawa: { label: "横浜市 神奈川区", officeName: "神奈川福祉保健センター（区役所）", phone: "045-411-7138" },
  yokohama_nishi: { label: "横浜市 西区", officeName: "西福祉保健センター（区役所）", phone: "045-320-8439" },
  yokohama_naka: { label: "横浜市 中区", officeName: "中福祉保健センター（区役所）", phone: "045-224-8332" },
  yokohama_minami: { label: "横浜市 南区", officeName: "南福祉保健センター（区役所）", phone: "045-341-1185" },
  yokohama_konan: { label: "横浜市 港南区", officeName: "港南福祉保健センター（区役所）", phone: "045-847-8438" },
  yokohama_hodogaya: { label: "横浜市 保土ケ谷区", officeName: "保土ケ谷福祉保健センター（区役所）", phone: "045-334-6344" },
  yokohama_asahi: { label: "横浜市 旭区", officeName: "旭福祉保健センター（区役所）", phone: "045-954-6146" },
  yokohama_isogo: { label: "横浜市 磯子区", officeName: "磯子福祉保健センター（区役所）", phone: "045-750-2445" },
  yokohama_kanazawa: { label: "横浜市 金沢区", officeName: "金沢福祉保健センター（区役所）", phone: "045-788-7840" },
  yokohama_kohoku: { label: "横浜市 港北区", officeName: "港北福祉保健センター（区役所）", phone: "045-540-2362" },
  yokohama_midori: { label: "横浜市 緑区", officeName: "緑福祉保健センター（区役所）", phone: "045-930-2357" },
  yokohama_aoba: { label: "横浜市 青葉区", officeName: "青葉福祉保健センター（区役所）", phone: "045-978-2438" },
  yokohama_tsuzuki: { label: "横浜市 都筑区", officeName: "都筑福祉保健センター（区役所）", phone: "045-948-2350" },
  yokohama_totsuka: { label: "横浜市 戸塚区", officeName: "戸塚福祉保健センター（区役所）", phone: "045-866-8426" },
  yokohama_izumi: { label: "横浜市 泉区", officeName: "泉福祉保健センター（区役所）", phone: "045-800-2445" },
  yokohama_sakae: { label: "横浜市 栄区", officeName: "栄福祉保健センター（区役所）", phone: "045-894-6964" },
  yokohama_seya: { label: "横浜市 瀬谷区", officeName: "瀬谷福祉保健センター（区役所）", phone: "045-367-5744" },
  sagamihara: { label: "相模原市", officeName: "相模原市保健所 疾病対策課（ウェルネスさがみはらB館4階）", phone: "042-769-7201", phoneNote: "書類受付のみ。区役所により受付窓口が異なる場合があります。" },
  fujisawa: { label: "藤沢市", officeName: "藤沢市保健所", phone: "0466-50-3593" },
};

export const KANAGAWA_OTHER_AREA_OPTIONS = Object.entries(KANAGAWA_OTHER_AREAS).map(([id, a]) => ({ id, label: a.label }));

export const MUNICIPALITIES = {
  kawasaki: {
    label: "川崎市",
    offices: {
      disabilityHandbook: "お住まいの区役所 高齢・障害課（障害者支援係）",
      designatedDisease: "お住まいの区役所 地域みまもり支援センター（福祉事務所・保健所支所）地域ケア推進課（指定難病医療費助成 申請窓口）",
      hepatitisTest: "川崎市健康福祉局 保健医療政策部 感染症対策課",
    },
    screeningNote:
      "川崎市では、川崎市で肝炎ウイルス検査を受けたことがない市民の方を対象に、無料・匿名で肝炎ウイルス検査（B型・C型）を受けられます（年齢制限なし）。区の協力医療機関、または区役所衛生課・日曜検査相談室で受けられます。事前予約が必要な場合があるため、必ず事前にお問い合わせください。",
  },
  kanagawa_other: {
    label: "神奈川県内（川崎市以外）",
    offices: {
      disabilityHandbook: "お住まいの市区町村 障害福祉担当課",
      designatedDisease: "お住まいを管轄する神奈川県保健福祉事務所（保健所）",
      hepatitisTest: "お住まいの市区町村の健診担当課、または保健所",
    },
    screeningNote:
      "肝炎ウイルス検診の実施の有無・対象年齢は市区町村により異なります。お住まいの市区町村の健診担当課にご確認ください。",
  },
  tokyo: {
    label: "東京都",
    offices: {
      disabilityHandbook: "お住まいの区市町村 障害福祉担当課",
      designatedDisease: "お住まいを管轄する保健所（特別区は区の保健所、市町村は東京都の保健所）",
      hepatitisTest: "お住まいの区市町村の健診担当課、または保健所",
    },
    screeningNote:
      "肝炎ウイルス検診の実施の有無・対象年齢は区市町村により異なります。お住まいの区市町村にご確認ください。",
  },
  outside: {
    label: "それ以外",
    offices: {
      disabilityHandbook: "お住まいの市区町村 障害福祉担当課",
      designatedDisease: "お住まいを管轄する保健所（都道府県または政令指定都市・中核市）",
      hepatitisTest: "お住まいの市区町村の健診担当課、または保健所",
    },
    screeningNote:
      "肝炎ウイルス検診の実施の有無・対象年齢は自治体により異なります。お住まいの市区町村にご確認ください。",
  },
};

export const GRADE_LABEL = { 1: "1級", 2: "2級", 3: "3級", 4: "4級" };

export function labelOf(options, id) {
  return options.find((o) => o.id === id)?.label ?? id;
}

// 肝がん・重度肝硬変治療研究促進事業の所得要件（年収約370万円以下）の確認用
export const AGE_GROUP_OPTIONS = [
  { id: "under70", label: "70歳未満" },
  { id: "over70", label: "70歳以上" },
];

export const INCOME_TIER_UNDER70_OPTIONS = [
  { id: "a", label: "区分ア" },
  { id: "i", label: "区分イ" },
  { id: "u", label: "区分ウ" },
  { id: "e", label: "区分エ" },
  { id: "o", label: "区分オ" },
];

export const COPAY_RATIO_70PLUS_OPTIONS = [
  { id: "1", label: "1割" },
  { id: "2", label: "2割" },
  { id: "3", label: "3割（現役並み）" },
];

export const INITIAL_ANSWERS = {
  diagnosis: [],
  diagnosisLabel: null,
  treatment: [],
  screening: null,
  residence: null,
  ward: null,
  tokyoMunicipality: null,
  kanagawaArea: null,
  doctorSeverity: {},
};

export const INITIAL_CLINICAL = {
  bilirubin: "", albumin: "", pt: "", ptInr: "", platelet: "", ast: "", alt: "", ammonia: "",
  ascites: null, encephalopathy: null, generalStatus: null, laborStatus: null,
  hccHistory: false, sbpHistory: false, varicesHistory: false, varicesPresent: false,
  fatigue: false, nauseaVomiting: false, muscleCramp: false,
  jaundice: false, pruritus: false, cholangitis: false, giBleeding: false, cholangiocarcinoma: false, liverAtrophy: false,
  noAlcohol180: false, activeTreatment: false, twoExamsConfirmed: false,
  alpRatio: "unknown", liverTransplant: "none", highCostMonths: "", plannedHighCostDrug: false,
  bcVarix: null, bcPortalSign: null, bcActivity: null, bcGiBleeding: false,
  wilsonEgfr: "", wilsonProteinuria: "", wilsonMrs: null,
  ageGroup: null, incomeTierUnder70: null, copayRatio70Plus: null,
};

// 指定難病の判定対象6疾病（軽症者特例の入力欄などをこの6疾病でのみ表示するために使用）
export const DESIGNATED_DISEASE_IDS = ["pbc", "psc", "aih", "wilson", "budd_chiari", "portal_hypertension"];
