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
    "Commissariat", "Tribunal", "Cellule", "Armurerie", "Bureau", "Archives", "Infirmerie", "Détention", "Archives"
  ],
  "Activités Mafia": [
    "Contrebande", "Racket", "Blanchiment", "Chantage", "Poursuite", "Traquenard", "Kidnapping", "Dealer", "Assassinat", "Intimidation", "Corruption"
  ],
  "Activités Police": [
    "Arrestation", "Raid", "Interrogatoire", "Poursuite", "Enquête", "Contrôle", "Juger"
  ],
  "Contenant": [
    "Bouteille", "Caisse", "Sacs", "Tonneau", "Coffre", "Carton", "Mallette"
  ],
  "Marchandise": [
    "Billets", "Lingot", "Alcool", "Tabac", "Parfums", "Bijoux",
  ],
  "Bijoux": [
    "Bague", "Montre", "Collier", "Chevalière", "Broche", "Chapelet"
  ],
  "Drogue": [
    "Cigare", "Cigarette", "Pipe", "Opium", "Morphine", "Cocaïne", "Héroïne"
  ],
  "Armes Blanche": [
    "Couteau", "Matraque", "Batte", "Corde", "Hache"
  ],
  "Armes à feu": [
    "Mitraillette", "Fusil à pompe", "Fusil", "Pistolet"
  ],
  "Moyens de transport": [
    "Voiture", "Train", "Bateau", "Moto", "Wagon", "Camion", "Taxi", "Cheval"
  ],
  "Principes moraux": [
    "Corruption", "Loyauté", "Vengeance", "Trahison", "Respect", "Justice"
  ],
  "Boissons chaudes": [
    "Café", "Thé", "Chocolat chaud", "Vin chaud"
  ],
  "Boissons Froides": [
    "Coca", "Jus de fruit", "Eau plate", "Eau pétillante", "Sirop", "Limonade"
  ],
  "Alcool": [
    "Whisky", "Bière", "Vin", "Rhum", "Pastis"
  ],
  "Viande": [
    "Rôti", "Steak", "Agneau", "Filet mignon", "Entrecôte", "Bavette"
  ],
  "Plat Froid": [
    "Sandwich", "Salade", "Tartare", "Jambon", "Quiche", "Velouté"
  ],
  "Fruits":[
    "Avocat", "Orange", "Pomme", "Poire", "Banane", "Pêche"
  ],
  "Poisson" : [
    "Truite", "Saumon", "Caviar", "Sardine", "Thon", "Cabillaud"
  ]
};
