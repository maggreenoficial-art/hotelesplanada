/* ==========================================================
   Hotel Esplanada — interações
   >>> EDITE AQUI os dados de contato do hotel <<<
   ========================================================== */
const CONFIG = {
  // Telefone único de contato (ligação e WhatsApp)
  whatsapp: "5567981223282",
  phone: "+5567981223282",
  phoneLabel: "(67) 98122-3282",
};

const waLink = (text) =>
  `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/* ---------- Contatos ---------- */
document.querySelectorAll("[data-phone]").forEach((a) => {
  a.href = `tel:${CONFIG.phone}`;
  a.textContent = CONFIG.phoneLabel;
});
document.querySelectorAll("[data-whats]").forEach((a) => {
  a.href = waLink("Olá! Gostaria de informações sobre hospedagem no Hotel Esplanada.");
});
document.querySelector("[data-whats-float]").href =
  waLink("Olá! Gostaria de informações sobre hospedagem no Hotel Esplanada.");
document.getElementById("ano").textContent = new Date().getFullYear();

/* ---------- Navegação ---------- */
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu-mobile");

const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  menu.hidden = !open;
  nav.classList.toggle("is-open", open);
};
toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
window.addEventListener("resize", () => { if (window.innerWidth > 1120) setMenu(false); });

// Link ativo conforme a seção visível
const links = [...document.querySelectorAll(".nav__links a")];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
links.forEach((l) => { const s = document.querySelector(l.getAttribute("href")); if (s) spy.observe(s); });

/* ---------- Animações de entrada ---------- */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); revealIO.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll("main > section:not(.hero) .reveal").forEach((el) => {
  // pequeno escalonamento entre irmãos
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 90}ms`;
  revealIO.observe(el);
});

/* ---------- Reserva via WhatsApp ---------- */
const form = document.getElementById("booking-form");
const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");
const note = document.getElementById("booking-note");
const roomSelect = document.getElementById("quarto");

const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const br = (s) => s.split("-").reverse().join("/");
const today = new Date();

/* ---------- Calendário próprio (estilo Airbnb) ---------- */
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEK_HTML = '<div class="dp__week" aria-hidden="true"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>';
const TOTAL_MONTHS = 12;
const pad = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (v) => { const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d, 12); };
const fmtShort = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short" });
const fmtLong = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const short = (v) => { const t = fmtShort.format(parse(v)).replace(/\./g, ""); return t.charAt(0).toUpperCase() + t.slice(1); };
const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);

const dp = document.getElementById("datepicker");
const dpMonths = dp.querySelector(".dp__months");
const dpBody = dp.querySelector(".dp__body");
const dpTitle = document.getElementById("dp-title");
const dpSub = document.getElementById("dp-sub");
const dpPrev = dp.querySelector(".dp__prev");
const dpNext = dp.querySelector(".dp__next");
const dpClear = dp.querySelector(".dp__clear");
const dpConfirm = dp.querySelector(".dp__confirm");
const triggers = { in: document.getElementById("checkin-btn"), out: document.getElementById("checkout-btn") };
const mobileMQ = window.matchMedia("(max-width: 767px)");
const todayISO = iso(today);
const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);

let sel = { start: null, end: null };
let phase = "start";   // qual data o próximo toque define
let hover = null;
let view = 0;          // 1º mês visível no desktop
let openedBy = null;

function renderMonths() {
  const mobile = mobileMQ.matches;
  const from = mobile ? 0 : view;
  const count = mobile ? TOTAL_MONTHS : 2;
  let html = "";
  for (let i = from; i < from + count; i++) {
    const md = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1);
    const y = md.getFullYear(), m = md.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    html += `<section class="dp__month"><h4>${MONTHS[m]} ${y}</h4>${WEEK_HTML}<div class="dp__grid" role="group" aria-label="${MONTHS[m]} ${y}">`;
    html += "<span></span>".repeat(md.getDay());
    for (let d = 1; d <= days; d++) {
      const v = toISO(y, m, d);
      html += `<button type="button" class="dp__day${v === todayISO ? " is-today" : ""}" data-date="${v}" tabindex="-1"` +
        `${v < todayISO ? " disabled" : ""} aria-label="${fmtLong.format(parse(v))}"><span>${d}</span></button>`;
    }
    html += "</div></section>";
  }
  dpMonths.innerHTML = html;
  dpPrev.disabled = view <= 0;
  dpNext.disabled = view >= TOTAL_MONTHS - 2;
  paint();
}

function paint() {
  const { start: s, end } = sel;
  const e = end || (s && phase === "end" && hover && hover > s ? hover : null);
  dpMonths.querySelectorAll(".dp__day").forEach((b) => {
    const v = b.dataset.date;
    b.classList.toggle("is-start", v === s);
    b.classList.toggle("is-linked", v === s && !!e);
    b.classList.toggle("is-end", !!e && v === e);
    b.classList.toggle("is-range", !!(s && e && v > s && v < e));
    b.setAttribute("aria-pressed", String(v === s || v === end));
  });
  if (!s) {
    dpTitle.textContent = "Quando você chega?";
    dpSub.textContent = "Escolha a data de entrada";
  } else if (!end) {
    dpTitle.textContent = "E a saída?";
    dpSub.textContent = `Entrada ${short(s)} · escolha a data de saída`;
  } else {
    const n = nightsBetween(s, end);
    dpTitle.textContent = `${n} ${n === 1 ? "noite" : "noites"} em Cassilândia`;
    dpSub.textContent = `${short(s)}  →  ${short(end)}`;
  }
  dpClear.disabled = !s;
  dpConfirm.disabled = !(s && end);
}

function syncFields() {
  checkin.value = sel.start || "";
  checkout.value = sel.end || "";
  [["in", checkin], ["out", checkout]].forEach(([k, input]) => {
    const t = triggers[k];
    t.querySelector(".date-trigger__value").textContent = input.value ? short(input.value) : "Adicionar data";
    t.classList.toggle("is-empty", !input.value);
    if (input.value) t.classList.remove("is-invalid");
  });
}

function focusDay(v) {
  const t = dpMonths.querySelector(`[data-date="${v}"]:not(:disabled)`);
  if (t) t.focus({ preventScroll: !mobileMQ.matches });
  return t;
}

function openDp(which) {
  sel = { start: checkin.value || null, end: checkout.value || null };
  phase = which === "out" && sel.start ? "end" : "start";
  hover = null;
  const anchor = sel.start ? parse(sel.start) : today;
  view = Math.max(0, Math.min(TOTAL_MONTHS - 2,
    (anchor.getFullYear() - firstMonth.getFullYear()) * 12 + anchor.getMonth() - firstMonth.getMonth()));
  openedBy = triggers[which];
  openedBy.setAttribute("aria-expanded", "true");
  renderMonths();
  dp.hidden = false;
  document.body.style.overflow = "hidden";
  dpBody.scrollTop = 0;
  if (mobileMQ.matches && sel.start) {
    const month = dpMonths.querySelector(`[data-date="${sel.start}"]`)?.closest(".dp__month");
    if (month) dpBody.scrollTop = month.offsetTop - 8;
  }
  requestAnimationFrame(() => dp.classList.add("is-open"));
  if (!mobileMQ.matches) setTimeout(() => focusDay(sel.start || todayISO) || dp.querySelector(".dp__close").focus(), 60);
  else dp.querySelector(".dp__close").focus({ preventScroll: true });
}

function closeDp() {
  if (dp.hidden) return;
  dp.classList.remove("is-open");
  document.body.style.overflow = "";
  Object.values(triggers).forEach((t) => t.setAttribute("aria-expanded", "false"));
  setTimeout(() => { dp.hidden = true; }, 320);
  if (openedBy) openedBy.focus({ preventScroll: true });
}

Object.entries(triggers).forEach(([k, t]) => t.addEventListener("click", () => openDp(k)));
dp.querySelectorAll("[data-dp-close]").forEach((el) => el.addEventListener("click", closeDp));
dpConfirm.addEventListener("click", closeDp);
dpClear.addEventListener("click", () => {
  sel = { start: null, end: null }; phase = "start"; hover = null;
  syncFields(); paint();
});
dpPrev.addEventListener("click", () => { if (view > 0) { view--; renderMonths(); } });
dpNext.addEventListener("click", () => { if (view < TOTAL_MONTHS - 2) { view++; renderMonths(); } });

dpMonths.addEventListener("click", (e) => {
  const b = e.target.closest(".dp__day");
  if (!b || b.disabled) return;
  const v = b.dataset.date;
  if (phase === "end" && sel.start && v > sel.start) { sel.end = v; phase = "start"; }
  else { sel = { start: v, end: null }; phase = "end"; }
  hover = null;
  syncFields(); paint();
});
dpMonths.addEventListener("mouseover", (e) => {
  if (phase !== "end" || sel.end || !sel.start || !window.matchMedia("(hover: hover)").matches) return;
  const b = e.target.closest(".dp__day");
  const v = b && !b.disabled ? b.dataset.date : null;
  if (v !== hover) { hover = v; paint(); }
});
dpMonths.addEventListener("mouseleave", () => { if (hover) { hover = null; paint(); } });

// Setas do teclado navegam entre os dias
dpMonths.addEventListener("keydown", (e) => {
  const b = e.target.closest(".dp__day");
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
  if (!b || !step) return;
  e.preventDefault();
  const d = parse(b.dataset.date); d.setDate(d.getDate() + step);
  const v = iso(d);
  if (!dpMonths.querySelector(`[data-date="${v}"]`) && !mobileMQ.matches) {
    if (step > 0 && view < TOTAL_MONTHS - 2) view++;
    else if (step < 0 && view > 0) view--;
    renderMonths();
  }
  focusDay(v);
});

// Esc fecha; Tab fica dentro do calendário
dp.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { e.preventDefault(); closeDp(); return; }
  if (e.key !== "Tab") return;
  const f = [...dp.querySelectorAll("button:not(:disabled)")]
    .filter((el) => el.offsetParent !== null && (el.tabIndex >= 0 || el === document.activeElement));
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
mobileMQ.addEventListener("change", () => { if (!dp.hidden) renderMonths(); });

document.querySelectorAll("[data-room]").forEach((a) =>
  a.addEventListener("click", () => { roomSelect.value = a.dataset.room; })
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!checkin.value || !checkout.value) {
    triggers.in.classList.toggle("is-invalid", !checkin.value);
    triggers.out.classList.toggle("is-invalid", !checkout.value);
    note.textContent = "Escolha as datas de entrada e saída para consultar.";
    note.classList.add("is-error");
    openDp(checkin.value ? "out" : "in");
    return;
  }
  note.classList.remove("is-error");
  note.textContent = "Abrindo o WhatsApp…";
  const nights = nightsBetween(checkin.value, checkout.value);
  const guests = form.hospedes.options[form.hospedes.selectedIndex].text;
  const msg =
    `Olá! Gostaria de consultar disponibilidade no Hotel Esplanada:\n\n` +
    `• Entrada: ${br(checkin.value)}\n` +
    `• Saída: ${br(checkout.value)} (${nights} ${nights === 1 ? "noite" : "noites"})\n` +
    `• Hóspedes: ${guests}\n` +
    `• Acomodação: ${roomSelect.value}`;
  window.open(waLink(msg), "_blank", "noopener");
});

/* ---------- Galeria / Lightbox ---------- */
const items = [...document.querySelectorAll(".g")];
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
const lbCap = lb.querySelector("figcaption");
let current = 0, lastFocus = null;

const show = (i) => {
  current = (i + items.length) % items.length;
  const img = items[current].querySelector("img");
  lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt;
};
const open = (i) => {
  lastFocus = document.activeElement;
  show(i); lb.hidden = false; document.body.style.overflow = "hidden";
  lb.querySelector(".lightbox__close").focus();
};
const close = () => {
  lb.hidden = true; document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
};
items.forEach((b, i) => b.addEventListener("click", () => open(i)));
lb.querySelector(".lightbox__close").addEventListener("click", close);
lb.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
lb.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));
lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
document.addEventListener("keydown", (e) => {
  if (lb.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});
let touchX = null;
lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  touchX = null;
});
