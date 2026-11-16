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
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
checkin.min = iso(today);
checkout.min = iso(tomorrow);

// Abre o calendário ao clicar/tocar no campo de data (sem precisar digitar)
[checkin, checkout].forEach((input) => {
  const openPicker = () => { try { input.showPicker(); } catch (_) { /* navegador sem suporte: usa o seletor nativo */ } };
  input.addEventListener("click", openPicker);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Tab" || e.key === "Escape") return;
    e.preventDefault();
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") openPicker();
  });
});

checkin.addEventListener("change", () => {
  if (!checkin.value) return;
  const next = new Date(`${checkin.value}T12:00:00`); next.setDate(next.getDate() + 1);
  checkout.min = iso(next);
  if (!checkout.value || checkout.value <= checkin.value) checkout.value = iso(next);
  checkin.classList.remove("is-invalid");
  // já abre o calendário da saída para agilizar
  setTimeout(() => { try { checkout.showPicker(); } catch (_) {} }, 150);
});

document.querySelectorAll("[data-room]").forEach((a) =>
  a.addEventListener("click", () => { roomSelect.value = a.dataset.room; })
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  [checkin, checkout].forEach((f) => f.classList.toggle("is-invalid", !f.value));
  if (!checkin.value || !checkout.value) {
    note.textContent = "Escolha as datas de entrada e saída para consultar.";
    note.classList.add("is-error");
    (checkin.value ? checkout : checkin).focus();
    return;
  }
  if (checkout.value <= checkin.value) {
    checkout.classList.add("is-invalid");
    note.textContent = "A data de saída precisa ser depois da entrada.";
    note.classList.add("is-error");
    checkout.focus();
    return;
  }
  note.classList.remove("is-error");
  note.textContent = "Abrindo o WhatsApp…";
  const nights = Math.round((new Date(checkout.value) - new Date(checkin.value)) / 86400000);
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
