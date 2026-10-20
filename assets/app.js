"use strict";
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const format = (n) => new Intl.NumberFormat("ru-RU").format(n);
const data = JSON.parse($("#strategy-data").textContent);
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const svg = (viewBox, content, label) =>
  `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" style="font-family:system-ui,sans-serif">${content}</svg>`;
const campaigns = $$(".campaign");
const priorityCounts = ["Высокий", "Средний", "Низкий"].map(
  (p) => campaigns.filter((c) => c.dataset.priority === p).length,
);
const colors = ["#4e7d59", "#a3b493", "#dce3d2"];
function renderBar() {
  const width = Math.max(280, $("#bar-chart").clientWidth),
    start = 90,
    step = (width - start - 30) / 3;
  const content =
    [0, 1, 2, 3]
      .map(
        (n) =>
          `<line x1="${start + n * step}" y1="10" x2="${start + n * step}" y2="175" stroke="#e9ede4"/><text x="${start + n * step}" y="202" text-anchor="middle" fill="#64735b" font-size="11">${n}</text>`,
      )
      .join("") +
    priorityCounts
      .map(
        (n, i) =>
          `<text x="0" y="${39 + i * 57}" fill="#65705f" font-size="12">${["Высокий", "Средний", "Низкий"][i]}</text><rect x="${start}" y="${18 + i * 57}" width="${n * step}" height="31" rx="3" fill="${colors[i]}"/><text x="${start + n * step + 10}" y="${39 + i * 57}" fill="#34432e" font-size="13" font-weight="600">${n}</text>`,
      )
      .join("");
  $("#bar-chart").innerHTML = svg(
    `0 0 ${width} 215`,
    content,
    "Количество кампаний: высокий приоритет — 3, средний — 2, низкий — 1.",
  );
}
renderBar();
const high = priorityCounts[0],
  total = campaigns.length,
  circumference = 2 * Math.PI * 72;
$("#radial-chart").innerHTML = svg(
  "0 0 230 210",
  `<circle cx="115" cy="103" r="72" fill="none" stroke="#e8ecdf" stroke-width="17"/><circle cx="115" cy="103" r="72" fill="none" stroke="#4e7d59" stroke-width="17" stroke-dasharray="${(circumference * high) / total} ${circumference}" transform="rotate(-90 115 103)"/><text x="115" y="104" text-anchor="middle" fill="#253220" style="font-family:Georgia,serif" font-size="46">${high}<tspan font-size="22" fill="#64735b"> / ${total}</tspan></text><text x="115" y="128" text-anchor="middle" fill="#6d7866" font-size="10">направлений в ядре</text>`,
  "Три из шести направлений имеют высокий приоритет.",
);
let rate = 6500;
function renderLine() {
  const area = Number($("#area").value),
    price = area * rate;
  $("#area-value").textContent = `${area} м²`;
  $("#price-value").textContent = `${format(price)} ₽`;
  $("#rate-note").textContent =
    rate === 6500
      ? "По базовой ставке из брифа. Финальные условия определяет студия."
      : "Иллюстрация гибкой ставки около 5 000 ₽/м². Доступность для конкретной площади нужно согласовать со студией.";
  const width = Math.max(280, $("#line-chart").clientWidth),
    height = width < 420 ? 235 : 255,
    left = 40,
    right = width - 22,
    bottom = height - 45;
  const x = (n) => left + ((n - 60) / 120) * (right - left);
  const y = (n) => bottom - (n / 1200000) * (bottom - 35);
  const points = [60, 90, 120, 150, 180]
    .map((n) => `${x(n)},${y(n * rate)}`)
    .join(" ");
  let chart = [0, 300000, 600000, 900000, 1200000]
    .map(
      (n) =>
        `<line x1="${left}" y1="${y(n)}" x2="${right}" y2="${y(n)}" stroke="#e7ebe2" stroke-dasharray="3 4"/><text x="${left - 9}" y="${y(n) + 4}" text-anchor="end" font-size="10" fill="#64735b">${n === 0 ? "0" : (n / 1000000).toLocaleString("ru-RU")}</text>`,
    )
    .join("");
  chart += `<text x="${left}" y="16" fill="#64735b" font-size="10">млн ₽</text><text x="${right}" y="${height - 2}" text-anchor="end" fill="#64735b" font-size="10">Площадь, м²</text>`;
  chart += [60, 90, 120, 150, 180]
    .map(
      (n) =>
        `<text x="${x(n)}" y="${bottom + 20}" text-anchor="middle" font-size="10" fill="#64735b">${n}</text>`,
    )
    .join("");
  chart += `<polygon points="${left},${bottom} ${points} ${right},${bottom}" fill="#eff4ec"/><polyline points="${points}" fill="none" stroke="#4e7d59" stroke-width="2.5"/>`;
  chart += [60, 90, 120, 150, 180]
    .map(
      (n) =>
        `<circle cx="${x(n)}" cy="${y(n * rate)}" r="3" fill="white" stroke="#4e7d59" stroke-width="1.8"/>`,
    )
    .join("");
  chart += `<line x1="${x(area)}" y1="${y(price)}" x2="${x(area)}" y2="${bottom}" stroke="#899c7b" stroke-dasharray="3 4"/><circle cx="${x(area)}" cy="${y(price)}" r="6" fill="#387453" stroke="white" stroke-width="2"/>`;
  const lx = Math.max(108, Math.min(x(area), width - 59)),
    ly = Math.max(34, y(price) - 18);
  chart += `<rect x="${lx - 51}" y="${ly - 16}" width="102" height="24" rx="4" fill="#263a24"/><text x="${lx}" y="${ly}" text-anchor="middle" font-size="11" fill="white">${format(price)} ₽</text>`;
  $("#line-chart").innerHTML = svg(
    `0 0 ${width} ${height}`,
    chart,
    `Стоимость дизайн-проекта при ставке ${rate} рублей за квадратный метр: от ${format(60 * rate)} рублей за 60 м² до ${format(180 * rate)} рублей за 180 м². Выбрано ${area} м²: ${format(price)} рублей.`,
  );
}
$("#area").addEventListener("input", renderLine);
$$("[data-rate]").forEach((button) =>
  button.addEventListener("click", () => {
    rate = Number(button.dataset.rate);
    $$("[data-rate]").forEach((b) => {
      const selected = b === button;
      b.classList.toggle("selected", selected);
      b.setAttribute("aria-pressed", String(selected));
    });
    renderLine();
  }),
);
renderLine();
$$(".filters [data-priority]").forEach((button) =>
  button.addEventListener("click", () => {
    const priority = button.dataset.priority;
    $$(".filters button").forEach((b) => {
      const selected = b === button;
      b.classList.toggle("selected", selected);
      b.setAttribute("aria-pressed", String(selected));
    });
    campaigns.forEach(
      (c) => (c.hidden = priority !== "all" && c.dataset.priority !== priority),
    );
    const count = campaigns.filter((c) => !c.hidden).length;
    $("#campaign-count").textContent =
      `Показано: ${count} из ${campaigns.length}`;
  }),
);
function selectAudience(index, focus = false) {
  const a = data.audience[index];
  $$("[data-audience]").forEach((b, i) => {
    b.setAttribute("aria-selected", String(i === index));
    b.tabIndex = i === index ? 0 : -1;
    if (i === index && focus) b.focus();
  });
  $("#audience-panel").setAttribute("aria-labelledby", `tab-${index}`);
  $("#audience-panel").innerHTML =
    `<div><span class="tag green">${escapeHTML(a.tag)}</span><h3>${escapeHTML(a.name)}</h3><p>${escapeHTML(a.why)}</p></div><div><h4>Что беспокоит</h4><ul>${a.pains.map((p) => `<li>${escapeHTML(p)}</li>`).join("")}</ul></div><div><h4>Примеры поисковых запросов</h4>${a.searches.map((s) => `<div class="search-phrase">${escapeHTML(s)}</div>`).join("")}</div>`;
}
$$("[data-audience]").forEach((button, index) => {
  button.addEventListener("click", () => selectAudience(index));
  button.addEventListener("keydown", (event) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % 4;
    else if (event.key === "ArrowLeft") next = (index + 3) % 4;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 3;
    else return;
    event.preventDefault();
    selectAudience(next, true);
  });
});
selectAudience(0);
const checks = $$("[data-check]");
try {
  const saved = JSON.parse(
    localStorage.getItem("zain-strategy-checklist-v1") || "[]",
  );
  if (Array.isArray(saved))
    checks.forEach((c) => (c.checked = saved.includes(c.dataset.check)));
} catch {}
function updateChecks() {
  const done = checks.filter((c) => c.checked);
  $("#check-count").textContent = `${done.length} / ${checks.length}`;
}
checks.forEach((c) =>
  c.addEventListener("change", () => {
    updateChecks();
    try {
      localStorage.setItem(
        "zain-strategy-checklist-v1",
        JSON.stringify(
          checks.filter((c) => c.checked).map((c) => c.dataset.check),
        ),
      );
    } catch {}
  }),
);
updateChecks();
const links = $$(".sidebar nav a");
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        links.forEach((a) => {
          const active = a.hash === `#${entry.target.id}`;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      }
    }
  },
  { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
);
links.forEach((a) => observer.observe($(a.hash)));

const chartWidths = new WeakMap();
const chartObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const width = Math.round(entry.contentRect.width);
    if (chartWidths.get(entry.target) === width) continue;
    chartWidths.set(entry.target, width);
    if (entry.target.id === "line-chart") renderLine();
    else renderBar();
  }
});
chartObserver.observe($("#line-chart"));
chartObserver.observe($("#bar-chart"));
