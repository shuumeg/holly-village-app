/* ==========================================================
   地域包括支援センター検索アプリ - スクリプト
   Supabase の centers テーブルからデータを取得して検索する。
   ========================================================== */

// ---------- Supabase接続設定 ----------
const SUPABASE_URL = "https://emxkorojlocgqzgezzri.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6tqwbLFKrCjl6wos75xZgw_xZdu4C1k";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ---------- DOM要素 ----------
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.querySelector(".search-button");
const resultsEl = document.getElementById("results");

// ---------- ユーティリティ ----------

// 郵便番号らしい文字列（数字とハイフンのみ、数字3桁以上）かどうか判定
function isZipLikeQuery(query) {
  return /^[0-9-]+$/.test(query) && query.replace(/[^0-9]/g, "").length >= 3;
}

// ハイフン等を除いた数字だけの文字列に変換
function digitsOnly(str) {
  return str.replace(/[^0-9]/g, "");
}

// 全角数字・スペースを半角に正規化（住所検索の揺れを吸収）
function normalizeText(str) {
  return str
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\s　]+/g, "")
    .trim();
}

// 文字が漢字・ひらがな・カタカナ（＝単語の続きとみなせる文字）かどうか判定
// undefined（文字列の末尾）の場合は続きではないので false を返す
function isKanjiOrKana(ch) {
  if (!ch) return false;
  return /[぀-ヿ㐀-鿿豈-﫿]/.test(ch);
}

// 「1・3丁目」「2〜7丁目」「3丁目」等の丁目表記を除去（町名だけを取り出す）
function stripChome(str) {
  return str.replace(/[0-9]+(?:[・、,][0-9]+)*(?:[〜~-][0-9]+)?丁目/g, "");
}

// "川崎市多摩区" のような市区町村名から、"多摩区" のような区だけの別名も作る
// （利用者が市名を省略して区名だけ入力することが多いため）
function getCityAliases(city) {
  if (!city) return [];
  const aliases = [city];
  const m = city.match(/^(.+?市)(.+区)$/);
  if (m) aliases.push(m[2]);
  return aliases;
}

// ---------- 検索ロジック ----------

async function searchCenters(rawQuery) {
  const query = normalizeText(rawQuery);
  if (!query) return { data: [], error: null };

  if (isZipLikeQuery(query)) {
    // center_zip_codes は「担当地区に含まれる全町名の郵便番号」を持つ対応表。
    // 施設自身の住所の郵便番号だけでなく、担当エリア内のどの郵便番号でもヒットする。
    const queryDigits = digitsOnly(query);
    const { data, error } = await supabaseClient
      .from("center_zip_codes")
      .select("centers(*)")
      .like("postal_code", `${queryDigits}%`);

    if (error) return { data: null, error };

    const seen = new Set();
    const centers = [];
    for (const row of data) {
      const center = row.centers;
      if (center && !seen.has(center.id)) {
        seen.add(center.id);
        centers.push(center);
      }
    }
    centers.sort((a, b) => a.prefecture.localeCompare(b.prefecture, "ja"));
    return { data: centers, error: null };
  }

  // 住所検索：全件取得し、「市区町村名＋町名」をつなげた入力にも対応できるよう
  // JS側で柔軟に一致判定する（データ件数が少ないため全件取得で十分）。
  const { data, error } = await supabaseClient.from("centers").select("*");
  if (error) return { data: null, error };

  // センターごとに一致の強さを判定する。
  // "exact"：住所そのものに一致／市区町村名のみの入力／担当地区の町名と完全に一致
  // "prefix"：担当地区の町名が入力を前方一致で含む（丁目除去の残骸などを拾うための保険）
  // 同じ入力で"exact"が1件でもあれば、"prefix"だけの結果は除外する。
  // （例：大和市「中央」で検索したとき、前方一致だけだと無関係な「中央林間」まで
  //   ヒットしてしまうが、"中央"自体が完全一致するセンターがあるならそちらだけを返す）
  function matchType(center) {
    // 住所そのものへの一致は、一致した直後が漢字・かな（＝別の単語の続き）でない
    // 場合のみ採用する。例："大和市中央"は「大和市中央林間」にも部分一致してしまう
    // が、一致直後が「林」（漢字）なので誤ヒットとして除外する。
    const addressIdx = center.address.indexOf(query);
    if (addressIdx !== -1 && !isKanjiOrKana(center.address[addressIdx + query.length])) {
      return "exact";
    }

    // "川崎市多摩区"だけでなく"多摩区"のように市名を省略した入力にも対応する。
    // 一致する別名のうち最も長いものを、市区町村名部分とみなして取り除く。
    const aliases = getCityAliases(center.city);
    const prefixAlias = aliases
      .filter((a) => query.startsWith(a))
      .sort((a, b) => b.length - a.length)[0];

    let remainderTown;
    if (prefixAlias !== undefined) {
      const rest = query.slice(prefixAlias.length);
      if (rest === "") return "exact"; // クエリが市区町村名（の別名）のみ
      remainderTown = stripChome(rest);
    } else if (aliases.some((a) => a.includes(query))) {
      return "exact"; // クエリが市区町村名の一部（例："多摩"）
    } else {
      remainderTown = stripChome(query);
    }

    if (remainderTown === "") return null;

    const towns = stripChome(center.area || "")
      .split(/[・、,]/)
      .map((t) => t.replace(/[（(].*?[）)]/g, "").replace(/の一部$/, "").trim())
      .filter(Boolean);

    if (towns.some((town) => town === remainderTown)) return "exact";

    // 前方一致（丁目除去の残骸（例："橋本～"）を拾うための保険。ただし完全一致が
    // 1件もない場合のみ使う＝下の呼び出し側でフィルタする）。
    if (towns.some((town) => town.startsWith(remainderTown))) return "prefix";

    return null;
  }

  const types = new Map(data.map((center) => [center.id, matchType(center)]));
  const exactMatches = data.filter((center) => types.get(center.id) === "exact");
  const matched = exactMatches.length > 0
    ? exactMatches
    : data.filter((center) => types.get(center.id) === "prefix");

  matched.sort((a, b) => a.prefecture.localeCompare(b.prefecture, "ja"));
  return { data: matched, error: null };
}

// ---------- 表示処理 ----------

function formatZip(postalCode) {
  if (!postalCode) return "";
  return `〒${postalCode.slice(0, 3)}-${postalCode.slice(3)}`;
}

// "2026-08-23" のような日付文字列を「2026年8月23日」表記に変換
function formatConfirmedDate(dateStr) {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return dateStr;
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

function renderResults(results, query) {
  resultsEl.innerHTML = "";

  if (!query) {
    resultsEl.innerHTML =
      '<p class="results-placeholder">郵便番号または住所を入力して検索してください。</p>';
    document.body.classList.remove("has-results");
    return;
  }

  document.body.classList.add("has-results");

  if (results.length === 0) {
    resultsEl.innerHTML =
      '<p class="results-empty">該当する地域包括支援センターが見つかりませんでした。<br>入力内容をご確認のうえ、再度検索してください。</p>';
    return;
  }

  const countEl = document.createElement("p");
  countEl.className = "results-count";
  countEl.textContent = `${results.length}件見つかりました`;
  resultsEl.appendChild(countEl);

  results.forEach((center) => {
    resultsEl.appendChild(createCenterCard(center));
  });
}

function renderError() {
  document.body.classList.add("has-results");
  resultsEl.innerHTML =
    '<p class="results-empty">データの取得に失敗しました。しばらくしてから再度お試しください。</p>';
}

function createCenterCard(center) {
  const card = document.createElement("article");
  card.className = "center-card";

  const zipBadge = center.postal_code
    ? `<span class="center-card__zip">${formatZip(center.postal_code)}</span>`
    : "";

  const areaRow = center.area
    ? `
    <p class="center-card__row">
      <span class="center-card__icon" aria-hidden="true">🗺️</span>
      <span>担当地区：${escapeHtml(center.area)}</span>
    </p>`
    : "";

  const confirmedRow = center.confirmed_on
    ? `<p class="center-card__confirmed">${escapeHtml(formatConfirmedDate(center.confirmed_on))}時点の情報</p>`
    : "";

  card.innerHTML = `
    ${zipBadge}
    <h2 class="center-card__name">${escapeHtml(center.name)}</h2>
    <p class="center-card__row">
      <span class="center-card__icon" aria-hidden="true">📍</span>
      <span>${escapeHtml(center.address)}</span>
    </p>
    <p class="center-card__row center-card__phone">
      <span class="center-card__icon" aria-hidden="true">📞</span>
      <a href="tel:${center.phone.replace(/-/g, "")}">${escapeHtml(center.phone)}</a>
    </p>
    ${areaRow}
    ${confirmedRow}
  `;

  return card;
}

// 簡易的なHTMLエスケープ（表示データがユーザー入力由来になった場合の保険）
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- イベント ----------

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value;
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    renderResults([], "");
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "検索中…";

  const { data, error } = await searchCenters(query);

  searchButton.disabled = false;
  searchButton.textContent = "検索";

  if (error) {
    console.error(error);
    renderError();
    return;
  }

  renderResults(data, normalizedQuery);
});
