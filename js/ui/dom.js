// Petits outils pour fabriquer l'interface.

/**
 * Crée un élément.  h("button", { class: "btn", onclick: fn }, "Texte")
 * Les textes sont toujours insérés comme texte (jamais comme HTML).
 */
export function h(tag, attrs = {}, ...enfants) {
  const el = document.createElement(tag);
  for (const [cle, val] of Object.entries(attrs || {})) {
    if (val === null || val === undefined || val === false) continue;
    if (cle.startsWith("on") && typeof val === "function") el.addEventListener(cle.slice(2), val);
    else if (cle === "class") el.className = val;
    else if (cle === "style" && typeof val === "object") Object.assign(el.style, val);
    else if (cle === "html") el.innerHTML = val; // réservé aux SVG écrits dans le code
    else if (val === true) el.setAttribute(cle, "");
    else el.setAttribute(cle, val);
  }
  ajouter(el, enfants);
  return el;
}

function ajouter(el, enfants) {
  for (const e of enfants.flat(Infinity)) {
    if (e === null || e === undefined || e === false) continue;
    el.append(e instanceof Node ? e : document.createTextNode(String(e)));
  }
}

export function vider(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/** Avatar rond avec la photo Google, ou l'initiale si pas de photo. */
export function avatar(joueur, taille = "") {
  const nom = (joueur && joueur.nom) || "?";
  const box = h("span", { class: `avatar ${taille}` });
  if (joueur && joueur.photo) {
    const img = h("img", { src: joueur.photo, alt: "", referrerpolicy: "no-referrer", loading: "lazy" });
    img.addEventListener("error", () => { img.remove(); box.textContent = nom.charAt(0).toUpperCase(); });
    box.append(img);
  } else {
    box.textContent = nom.charAt(0).toUpperCase();
  }
  return box;
}

export const prenom = (nom) => String(nom || "").trim().split(/\s+/)[0] || "convive";

let minuteurToast = null;
/** Message bref en bas de l'écran. */
export function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = h("div", { id: "toast", role: "status", "aria-live": "polite" });
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => el.classList.remove("visible"), 3200);
}

/** Petit ornement décoratif (filet avec losange). */
export function filet() {
  return h("div", { class: "filet", "aria-hidden": "true" }, h("span"));
}
