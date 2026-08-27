const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const imageCarte = document.getElementById('image-carte');
const motPropose = document.getElementById('mot-propose');
const resultatVF = document.getElementById('resultat-vf');
const boutonReveler = document.getElementById('bouton-reveler');
const boutonSuivante = document.getElementById('bouton-suivante');
const compteurCartes = document.getElementById('compteur-cartes');
const boutonRejouer = document.getElementById('bouton-rejouer');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let cartesAvecMot = [];
let selectionActuelle = [];
let pioche = [];
let totalManche = 0;
let carteActuelle = null;
let estVraiActuel = true;

initialiserCurseurTaille();
initialiserCurseurTexte();
initialiserTableauScores();

function signalerErreur(message) {
  erreurChargement.textContent = message;
  erreurChargement.hidden = false;
  boutonDemarrer.disabled = true;
}

async function init() {
  if (!slug) {
    signalerErreur('Aucun ensemble sélectionné. Retournez à l\'accueil pour en choisir un.');
    return;
  }
  lienRetour.href = '../index.html?set=' + encodeURIComponent(slug);

  try {
    manifest = await chargerEnsemble(slug);
  } catch (err) {
    signalerErreur('Impossible de charger cet ensemble.');
    return;
  }

  cartesAvecMot = (manifest.cartes || []).filter((c) => c.motAssocie);
  if (cartesAvecMot.length < 2) {
    signalerErreur('Ce jeu nécessite au moins 2 cartes avec un mot associé renseigné (à ajouter depuis l\'espace enseignant).');
    return;
  }

  nomEnsembleEl.textContent = manifest.nom;
  initialiserSelecteurCartes(zoneSelecteur, cartesAvecMot, slug, { min: 2, defaut: Math.min(10, cartesAvecMot.length) });
}

boutonDemarrer.addEventListener('click', () => {
  const selection = lireSelectionCartes(zoneSelecteur, cartesAvecMot);
  if (selection.length < 2) {
    erreurChargement.textContent = 'Choisissez au moins 2 cartes différentes.';
    erreurChargement.hidden = false;
    return;
  }
  erreurChargement.hidden = true;
  ecranConfig.hidden = true;
  ecranJeu.hidden = false;
  demarrerManche(selection);
});

function demarrerManche(selection) {
  selectionActuelle = selection;
  pioche = melanger(selection);
  totalManche = pioche.length;
  boutonSuivante.disabled = false;
  boutonRejouer.hidden = true;
  nouvelleQuestion();
}

function nouvelleQuestion() {
  if (!pioche.length) {
    imageCarte.hidden = true;
    motPropose.textContent = '';
    resultatVF.hidden = true;
    compteurCartes.textContent = 'Manche terminée !';
    boutonSuivante.disabled = true;
    boutonRejouer.hidden = false;
    return;
  }

  carteActuelle = pioche.shift();
  estVraiActuel = Math.random() < 0.5;

  if (estVraiActuel || selectionActuelle.length < 2) {
    estVraiActuel = true;
    motPropose.textContent = carteActuelle.motAssocie;
  } else {
    const autres = selectionActuelle.filter((c) => c.fichier !== carteActuelle.fichier);
    const leurre = autres[Math.floor(Math.random() * autres.length)];
    motPropose.textContent = leurre.motAssocie;
  }

  imageCarte.src = urlImage(slug, carteActuelle.fichier);
  imageCarte.alt = '';
  imageCarte.hidden = false;
  resultatVF.hidden = true;
  resultatVF.className = 'statut-jeu';
  compteurCartes.textContent = (totalManche - pioche.length) + ' / ' + totalManche;
}

boutonReveler.addEventListener('click', () => {
  if (!carteActuelle) return;
  if (estVraiActuel) {
    resultatVF.textContent = 'VRAI !';
    resultatVF.className = 'statut-jeu reponse-vraie';
  } else {
    resultatVF.textContent = 'FAUX ! Le bon mot était : ' + carteActuelle.motAssocie;
    resultatVF.className = 'statut-jeu reponse-fausse';
  }
  resultatVF.hidden = false;
});

boutonSuivante.addEventListener('click', () => {
  nouvelleQuestion();
});

boutonRejouer.addEventListener('click', () => {
  demarrerManche(selectionActuelle);
});

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
