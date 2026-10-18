// La sonnette d'Al Capone : le dessin et le son.

import { REGLES } from "../config/regles.js";
import { h } from "./dom.js";

// ---------- Son ----------
let audio = null;
let deverrouille = false;

function obtenirAudio() {
  if (!REGLES.sonSonnette) return null;
  if (!audio) {
    audio = new Audio(REGLES.sonSonnette);
    audio.preload = "auto";
  }
  return audio;
}

/**
 * Les navigateurs mobiles bloquent le son tant que l'utilisateur n'a pas touché
 * l'écran. On "débloque" le son au premier toucher.
 */
export function preparerSon() {
  if (!REGLES.sonSonnette) return;
  const debloquer = () => {
    if (deverrouille) return;
    deverrouille = true;
    const a = obtenirAudio();
    a.muted = true;
    a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false; })
      .catch(() => { a.muted = false; deverrouille = false; });
  };
  window.addEventListener("pointerdown", debloquer, { capture: true });
  window.addEventListener("keydown", debloquer, { capture: true });
}

export function sonner() {
  if (navigator.vibrate) navigator.vibrate(40);
  const a = obtenirAudio();
  if (!a) return;
  try {
    a.muted = false;
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* son indisponible */ }
}

// ---------- Dessin ----------
const SVG_SONNETTE = `
<svg viewBox="0 0 200 170" aria-hidden="true">
  <defs>
    <linearGradient id="sn-dome" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#6d7279"/>
      <stop offset=".28" stop-color="#e9ecef"/>
      <stop offset=".45" stop-color="#b7bcc2"/>
      <stop offset="1" stop-color="#4c5157"/>
    </linearGradient>
    <linearGradient id="sn-socle" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#2a0a10"/>
      <stop offset="1" stop-color="#140306"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="156" rx="86" ry="10" fill="#000" opacity=".35"/>
  <rect x="18" y="128" width="164" height="24" rx="6" fill="url(#sn-socle)" stroke="#efe4cc" stroke-opacity=".35"/>
  <g class="sn-bouton">
    <rect x="94" y="22" width="12" height="26" rx="3" fill="url(#sn-dome)"/>
    <ellipse cx="100" cy="22" rx="16" ry="6" fill="url(#sn-dome)"/>
  </g>
  <path d="M28 130 C28 78 60 46 100 46 C140 46 172 78 172 130 Z" fill="url(#sn-dome)"/>
  <path d="M52 112 C56 84 74 64 98 58" stroke="#fff" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/>
  <rect x="24" y="126" width="152" height="6" rx="3" fill="#8b9097"/>
</svg>`;

/**
 * Crée la sonnette.
 * @param {Function} surSonner  appelée quand on appuie
 */
export function creerSonnette(surSonner) {
  const bouton = h("button", {
    class: "sonnette",
    type: "button",
    "aria-label": "Sonner",
    html: SVG_SONNETTE
  });
  bouton.addEventListener("click", () => {
    if (bouton.disabled) return;
    bouton.classList.remove("appuyee");
    void bouton.offsetWidth; // relance l'animation
    bouton.classList.add("appuyee");
    surSonner();
  });
  return bouton;
}
