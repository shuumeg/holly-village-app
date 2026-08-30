const LEVEL_ORDER = { high: 0, caution: 1, low: 2 };

// 「身体障害者手帳（肝臓機能障害）」のような名前を、最初の（の前で改行して2行で見せる
function splitParenSuffix(name) {
  const idx = name.indexOf("（");
  if (idx === -1) return [name, null];
  return [name.slice(0, idx), name.slice(idx)];
}

export default function TrafficLightSummary({ items }) {
  const sorted = [...items].sort((a, b) => LEVEL_ORDER[a.light.level] - LEVEL_ORDER[b.light.level]);

  return (
    <div className="traffic-grid">
      {sorted.map((item) => {
        const [nameMain, nameSuffix] = splitParenSuffix(item.name);
        return (
          <article key={item.key} className={`traffic-card traffic-card--${item.light.level}`}>
            <span className="traffic-card__emoji" aria-hidden="true">{item.light.emoji}</span>
            <h3 className="traffic-card__name">
              {nameMain}
              {nameSuffix && <><br />{nameSuffix}</>}
            </h3>
            <p className="traffic-card__text">{item.light.text}</p>
          </article>
        );
      })}
    </div>
  );
}
