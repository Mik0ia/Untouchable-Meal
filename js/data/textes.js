// Textes affichés dans le jeu. Modifie-les librement.

export const TEXTES = {
  titre: "Untouchable Meal",
  invitation:
    "Monsieur Capone a le plaisir de vous convier à sa table. " +
    "Tenue correcte exigée, langue bien pendue recommandée.",
  connexion: "Se connecter avec Google",
  connexionErreur: "La connexion a échoué. Réessaie, ou autorise les fenêtres pop-up.",
  deconnexion: "Se déconnecter",

  // Accueil
  bonsoir: (prenom) => `Bonsoir, ${prenom}.`,
  creer: "Dresser une table",
  rejoindre: "Rejoindre une table",

  // Création
  creerTitre: "Dresser une table",
  nomTable: "Nom de la table",
  nomTableExemple: "Le salon de Chicago",
  maxJoueurs: "Nombre de convives maximum",
  privee: "Table privée",
  priveeAide: "Invisible dans la liste. On la rejoint uniquement avec son code.",
  creerBouton: "Dresser la table",
  retour: "Retour",

  // Rejoindre
  rejoindreTitre: "Tables ouvertes",
  aucuneTable: "Aucune table ouverte pour le moment. Dresse la tienne, ou entre un code.",
  code: "Code de la table",
  rejoindreCode: "Rejoindre avec ce code",
  codeInconnu: "Aucune table ne porte ce code.",
  tableComplete: "Cette table est complète.",
  tableEnCours: "La partie a déjà commencé à cette table.",
  convives: (n, max) => `${n} / ${max} convives`,

  // Salon
  hote: "Hôte",
  partager: "Donne ce code à tes invités",
  lancer: "Servir le dîner",
  attenteMin: (min) => `Il faut au moins ${min} convives pour commencer.`,
  attenteHote: "L'hôte servira le dîner quand tout le monde sera là.",
  quitter: "Quitter la table",
  quitterCourt: "Quitter",
  quitterTitre: "Quitter la table ?",
  quitterJoueur: "Tu quittes la partie en cours. Tu pourras revenir avec le code de la table.",
  quitterHote: "Tu es l'hôte : si tu pars, la partie s'arrête pour tout le monde.",
  arreterPourTous: "Arrêter la partie pour tous",
  annuler: "Annuler",
  chargementLong: "Ça ne charge pas ?",

  // Cartes
  toucherCarte: "Touche la carte pour la retourner",
  pret: "Je suis prêt",
  reposeTelephone: "Ta carte est retournée. Garde ton rôle pour toi, la partie commence quand tout le monde est prêt.",
  enAttente: (n, total) => `${n} sur ${total} sont prêts`,
  forcer: "Commencer sans attendre",
  maCarte: "Ma carte",

  // Tours
  souleverCloche: "Fais glisser la cloche pour découvrir ton mot",
  categorie: "Catégorie du mot",
  tonMot: "Ton mot",
  sonner: "Sonne pour passer au plat suivant",
  sonnerDernier: "Sonne pour finir le repas",
  capone: "Écoute bien tes acolytes.",
  carnet: "Carnet",
  carnetAide: "Tes notes restent sur ton téléphone.",

  // Serveur
  serveurChoix: "Chez qui jettes-tu un œil pour ce plat ?",
  serveurPasEncore: "Choisis d'abord un convive",
  serveurPlateau: "Choisis un convive",
  serveurRegarder: (nom) => `Regarder chez ${nom}`,
  serveurAttente: "Tu t'approches discrètement…",
  serveurMotDe: (nom) => `Mot de ${nom}`,
  serveurCategorie: "La catégorie est :",

  // Élimination
  eliminationTitre: "L'heure des comptes",
  eliminationCapone: "Choisis qui quitte la table. Si c'est le policier, tu gagnes sur-le-champ.",
  eliminationAttente: "Al Capone choisit qui va quitter la table…",
  eliminer: (nom) => `Éliminer ${nom}`,
  epargner: "N'éliminer personne",
  etaitPolicier: (nom) => `${nom} était le policier.`,
  netaitPasPolicier: (nom) => `${nom} n'était pas le policier.`,
  personneElimine: "Al Capone a épargné tout le monde.",
  policierEliminePiege: "Le policier compte pour 0 point : Al Capone doit encore trouver au moins un mot pour gagner.",
  toiExecute: "Al Capone t'a fait exécuter. Reste à table et savoure la suite.",

  // Réponses
  reponsesTitre: "Le mot de la fin",
  reponsesConsigne: "Écris le mot que tu penses avoir deviné pour chaque plat.",
  reponsesCaponeTraitres: "Le policier est tombé, mais il compte pour 0 point : si tu ne trouves aucun mot, il gagne quand même.",
  reponsesCaponeTraitresSuite: "Méfie-toi aussi des traîtres : chaque mot à eux que tu écris leur rapporte un point.",
  reponsesPolicier: "Écris les mots d'Al Capone pour chaque plat.",
  envoyer: "Rendre ma copie",
  reponseEnvoyee: "Ta copie est rendue. On attend la dernière…",
  reponsesAttente: "Les réponses sont en cours d'écriture…",

  // Résultats
  victoireCapone: "Al Capone et ses acolytes l'emportent",
  victoirePolicier: "La police l'emporte",
  victoireTraitres: "Les traîtres l'emportent",
  raisonPolicierElimine: "Le policier a été démasqué et éliminé.",
  rejouer: "Rejouer avec cette table",
  retourAccueil: "Quitter la table",

  // Divers
  hoteParti: "L'hôte s'est déconnecté. Le jeu reprendra quand il reviendra.",
  erreur: "Une erreur est survenue. Recharge la page."
};
