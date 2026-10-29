// Rôles et composition des tables.

// Identifiants des rôles (ne pas les renommer : ils sont utilisés dans le code
// et dans les règles de sécurité Firebase).
export const CAPONE = "capone";
export const ACOLYTE = "acolyte";
export const POLICIER = "policier";
export const TRAITRE = "traitre";
export const SERVEUR = "serveur";

// Description de chaque rôle : nom affiché, image de la carte, objectif.
export const ROLES = {
  [CAPONE]: {
    nom: "Al Capone",
    carte: "ressources/cartes/al-capone.webp",
    objectif:
      "Tu ne vois aucun mot. Écoute tes acolytes et devine le mot de chaque plat. " +
      "Ta sonnette fait passer au plat suivant. À la fin, tu peux éliminer un " +
      "joueur : si c'est le policier, tu gagnes."
  },
  [ACOLYTE]: {
    nom: "Acolyte",
    carte: "ressources/cartes/acolyte.webp",
    objectif:
      "Soulève la cloche pour voir le mot du plat. Fais-le deviner à Al Capone " +
      "sans le rendre évident : le policier écoute."
  },
  [POLICIER]: {
    nom: "Policier",
    carte: "ressources/cartes/policier.webp",
    objectif:
      "Tu ne connais que la catégorie du mot. Démasque les mots d'Al Capone : " +
      "si tu en trouves autant ou plus que lui, tu gagnes. Ne te fais pas repérer."
  },
  [TRAITRE]: {
    nom: "Traître",
    carte: "ressources/cartes/traitre.webp",
    objectif:
      "Ton mot est de la même catégorie que celui des acolytes, que tu connais aussi " +
      "(en petit sous le tien). Glisse ton mot dans la " +
      "conversation : chaque fois qu'Al Capone ou le policier l'écrit, tu marques " +
      "un point. Autant de points qu'Al Capone et plus que le policier, et ton équipe " +
      "de traîtres gagne, même si tu as été éliminé."
  },
  [SERVEUR]: {
    nom: "Serveur",
    carte: "ressources/cartes/serveur.webp",
    objectif:
      "Tu es dans l'équipe du policier. À chaque plat, choisis discrètement un " +
      "convive (sauf Al Capone) et découvre son mot, ou la catégorie si c'est le " +
      "policier. Tu n'écris rien à la fin : aide le policier à trouver les mots, " +
      "tu gagnes avec lui."
  }
};

// Dos de carte affiché avant la révélation.
export const DOS_DE_CARTE = "ressources/cartes/dos.webp";

// Composition selon le nombre de joueurs.
// Il doit toujours y avoir exactement 1 Al Capone et 1 policier.
export const COMPOSITIONS = {
  3:  [ACOLYTE, CAPONE, POLICIER],
  4:  [ACOLYTE, CAPONE, POLICIER, TRAITRE],
  5:  [ACOLYTE, ACOLYTE, CAPONE, POLICIER, TRAITRE],
  6:  [ACOLYTE, ACOLYTE, CAPONE, POLICIER, SERVEUR, TRAITRE],
  7:  [ACOLYTE, ACOLYTE, SERVEUR, CAPONE, POLICIER, TRAITRE, TRAITRE],
  8:  [ACOLYTE, ACOLYTE, ACOLYTE, CAPONE, POLICIER, SERVEUR, TRAITRE, TRAITRE],
  9:  [ACOLYTE, ACOLYTE, ACOLYTE, CAPONE, POLICIER, SERVEUR, TRAITRE, TRAITRE, TRAITRE],
  10: [ACOLYTE, ACOLYTE, ACOLYTE, ACOLYTE, CAPONE, POLICIER, SERVEUR, TRAITRE, TRAITRE, TRAITRE]
};

// Composition quand l'hôte retire le serveur : on prend la ligne du dessus
// (un joueur de plus) et on enlève le serveur. À 10, le serveur devient un traître.
export const COMPOSITIONS_SANS_SERVEUR = {
  3:  [ACOLYTE, CAPONE, POLICIER],
  4:  [ACOLYTE, CAPONE, POLICIER, TRAITRE],
  5:  [ACOLYTE, ACOLYTE, CAPONE, POLICIER, TRAITRE],
  6:  [ACOLYTE, ACOLYTE, CAPONE, POLICIER, TRAITRE, TRAITRE],
  7:  [ACOLYTE, ACOLYTE, ACOLYTE, CAPONE, POLICIER, TRAITRE, TRAITRE],
  8:  [ACOLYTE, ACOLYTE, ACOLYTE, CAPONE, POLICIER, TRAITRE, TRAITRE, TRAITRE],
  9:  [ACOLYTE, ACOLYTE, ACOLYTE, ACOLYTE, CAPONE, POLICIER, TRAITRE, TRAITRE, TRAITRE],
  10: [ACOLYTE, ACOLYTE, ACOLYTE, ACOLYTE, CAPONE, POLICIER, TRAITRE, TRAITRE, TRAITRE, TRAITRE]
};

/** Composition à utiliser pour une table, avec ou sans serveur. */
export function composition(nbJoueurs, avecServeur = true) {
  const table = avecServeur ? COMPOSITIONS : COMPOSITIONS_SANS_SERVEUR;
  return table[nbJoueurs] || null;
}
