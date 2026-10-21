// Réglages du jeu. Modifie les valeurs ici, tout le reste s'adapte.

export const REGLES = {
  // Durée d'un tour par défaut, en secondes.
  dureeTour: 120,

  // Durées proposées à l'hôte (en secondes), à la création et dans le salon.
  dureesProposees: [60, 90, 120, 150, 180, 210],

  // Nom des tours, dans l'ordre. Le nombre de tours = nombre de noms.
  tours: ["Entrée", "Plat", "Dessert"],

  // Nombre de joueurs autorisés pour lancer une partie.
  minJoueurs: 3,
  maxJoueurs: 10,

  // true : chaque tour tire une catégorie différente.
  categoriesDifferentes: true,

  // Si Al Capone élimine UN traître alors qu'il y en a plusieurs :
  //   false -> les autres traîtres restent en jeu et peuvent encore gagner
  //   true  -> les points de toute l'équipe des traîtres sont ignorés
  unTraitreMortElimineTousLesTraitres: false,

  // Comparaison des réponses :
  //   true  -> le mot de l'entrée doit être écrit dans la case "Entrée", etc.
  //   false -> un mot trouvé compte, quelle que soit la case
  comparaisonParTour: true,

  // Les points des traîtres comptent pour chaque réponse qui contient leur mot.
  // Si Al Capone ET le policier écrivent le même mot de traître, ça fait 2 points.
  traitresComptentChaqueReponse: true,

  // Al Capone ne peut pas sonner pendant les X premières secondes d'un tour
  // (évite de passer deux tours d'un coup par un double clic).
  delaiAvantSonnette: 3,

  // Longueur du code des tables (parties).
  longueurCode: 5
};
