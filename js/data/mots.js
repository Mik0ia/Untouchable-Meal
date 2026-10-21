// Mots secrets, rangés par catégorie.
// - Le nom de la catégorie est ce que voit le policier.
// - Ajoute, retire ou renomme librement. Il faut au moins 2 mots par catégorie
//   (un pour les acolytes, un autre pour les traîtres).
// - Les doublons sont ignorés automatiquement.

export const CATEGORIES = {
  "Lieux mafia": [
    "Planque", "Hôtel", "Bar", "Distillerie", "Casino", "Cabaret", "Ruelle", "Restaurant", "Cinéma"
  ],
  "Lieux police": [
    "Commissariat", "Tribunal", "Cellule", "Armurerie", "Interrogatoire",
    "Bureau", "Archives", "Infirmerie"
  ],
  "Activités": [
    "Contrebande", "Racket", "Arrestation", "Blanchiment", "Chantage",
    "Poursuite", "Traquenard", "Kidnapping"
  ],
  "Objets": [
    "Cigare", "Bouteille", "Bague", "Billets", "Caisse", "Sacs",
    "Jukebox", "Tonneau", "Montre", "Tourne-Disque", "Bible"
  ],
  "Armes Blanche": [
    "Couteau", "Matraque", "Batte", "Corde", "Hache"
  ],
  "Armes à feu": [
    "Mitraillette", "Fusil à pompe", "Fusil", "Pistolet", "Silencieux"
  ],
  "Moyens de transport": [
    "Ford", "Train", "Bateau", "Calèche", "Moto", "Wagon", "Camion", "Taxi", "Wagon", "Cheval"
  ],
  "Principes moraux": [
    "Corruption", "Loyauté", "Vengeance", "Trahison", "Intimidation",
    "Respect", "Justice"
  ],
  "Boisson": [
    "Whisky", "Bière","Café", "Vin", "Rhum", "Coca", "Eau", "Liqueur"
  ],
  "Nourriture": [
    "Caviar", "Rôti", "Sandwich", "Poisson", "Pain", "Steak", "Salade",
  ]
};
