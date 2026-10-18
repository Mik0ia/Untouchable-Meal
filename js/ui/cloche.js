// La cloche en acier : on la fait glisser du doigt ou à la souris pour voir
// ce qu'il y a dessous. Relâchée, elle revient se poser sur l'assiette.

import { h } from "./dom.js";

const SVG_CLOCHE = `
<svg viewBox="0 0 240 190" aria-hidden="true">
  <defs>
    <linearGradient id="cl-acier" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#55595f"/>
      <stop offset=".22" stop-color="#c9cdd2"/>
      <stop offset=".34" stop-color="#f4f6f8"/>
      <stop offset=".5" stop-color="#a9aeb4"/>
      <stop offset=".78" stop-color="#7b8087"/>
      <stop offset="1" stop-color="#3f4348"/>
    </linearGradient>
    <linearGradient id="cl-bord" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#d8dbdf"/>
      <stop offset="1" stop-color="#6a6f75"/>
    </linearGradient>
  </defs>
  <path d="M14 168 C14 84 62 34 120 34 C178 34 226 84 226 168 Z" fill="url(#cl-acier)"/>
  <path d="M44 146 C48 98 76 64 112 54" stroke="#fff" stroke-opacity=".6" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M60 150 C62 124 72 104 86 92" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="4" y="164" width="232" height="14" rx="7" fill="url(#cl-bord)"/>
  <rect x="108" y="20" width="24" height="16" rx="4" fill="url(#cl-acier)"/>
  <ellipse cx="120" cy="18" rx="24" ry="9" fill="url(#cl-bord)"/>
</svg>`;

/**
 * Crée une cloche posée sur un contenu.
 * @param {HTMLElement} dessous  le contenu caché (le mot)
 * @param {Function} [surPremiereLevee]  appelée la première fois qu'on soulève
 */
export function creerCloche(dessous, surPremiereLevee) {
  const cloche = h("div", {
    class: "cloche",
    role: "button",
    tabindex: "0",
    "aria-label": "Cloche : fais-la glisser pour voir ton mot",
    html: SVG_CLOCHE
  });
  const zone = h("div", { class: "zone-cloche" }, h("div", { class: "sous-cloche" }, dessous), cloche);

  let depart = null;
  let dejaLevee = false;

  const placer = (x, y, anime) => {
    cloche.style.transition = anime ? "" : "none";
    cloche.style.transform = `translate(${x}px, ${y}px)`;
    const distance = Math.hypot(x, y);
    zone.classList.toggle("levee", distance > 40);
    if (distance > 40 && !dejaLevee) {
      dejaLevee = true;
      if (surPremiereLevee) surPremiereLevee();
    }
  };

  cloche.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    cloche.setPointerCapture(e.pointerId);
    depart = { x: e.clientX, y: e.clientY };
    cloche.classList.add("tenue");
  });

  cloche.addEventListener("pointermove", (e) => {
    if (!depart) return;
    // Limite le déplacement à l'écran.
    const maxX = window.innerWidth * 0.6;
    const maxY = window.innerHeight * 0.45;
    const dx = Math.max(-maxX, Math.min(maxX, e.clientX - depart.x));
    const dy = Math.max(-maxY, Math.min(maxY, e.clientY - depart.y));
    placer(dx, dy, false);
  });

  const relacher = () => {
    if (!depart) return;
    depart = null;
    cloche.classList.remove("tenue");
    placer(0, 0, true);
  };
  cloche.addEventListener("pointerup", relacher);
  cloche.addEventListener("pointercancel", relacher);
  cloche.addEventListener("lostpointercapture", relacher);

  // Clavier : maintenir Espace ou Entrée soulève la cloche.
  cloche.addEventListener("keydown", (e) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); placer(0, -120, true); }
  });
  cloche.addEventListener("keyup", (e) => {
    if (e.key === " " || e.key === "Enter") placer(0, 0, true);
  });

  return zone;
}
