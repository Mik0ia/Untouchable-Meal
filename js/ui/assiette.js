// L'assiette : son bord sert de chrono, son centre accueille le mot (sous la cloche)
// ou la sonnette d'Al Capone.

import { h } from "./dom.js";

const RAYON = 47; // en unités du viewBox (100 x 100)
const CIRCONF = 2 * Math.PI * RAYON;

export function creerAssiette() {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("class", "assiette-chrono");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `
    <circle cx="50" cy="50" r="${RAYON}" class="chrono-fond"/>
    <circle cx="50" cy="50" r="${RAYON}" class="chrono-reste"
      stroke-dasharray="${CIRCONF}" stroke-dashoffset="0"
      transform="rotate(-90 50 50)"/>`;
  const arc = svg.querySelector(".chrono-reste");

  const contenu = h("div", { class: "assiette-contenu" });
  const temps = h("div", { class: "chrono-temps", role: "timer", "aria-live": "off" }, "");
  const el = h("div", { class: "assiette" },
    svg,
    h("div", { class: "assiette-porcelaine" }, contenu)
  );

  return {
    el,
    contenu,
    temps,
    /** fraction : 1 = plein, 0 = écoulé */
    majChrono(secondesRestantes, fraction) {
      const f = Math.max(0, Math.min(1, fraction));
      arc.setAttribute("stroke-dashoffset", String(CIRCONF * (1 - f)));
      const s = Math.max(0, Math.ceil(secondesRestantes));
      temps.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
      el.classList.toggle("urgent", s <= 15);
    }
  };
}
