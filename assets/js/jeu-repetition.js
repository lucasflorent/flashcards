const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const imageCarte = document.getElementById('image-carte');
const motCarte = document.getElementById('mot-carte');
const compteurCartes = document.getElementById('compteur-cartes');
const boutonPrecedent = document.getElementById('bouton-precedent');
const boutonSuivant = document.getElementById('bouton-suivant');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let pioche = [];
let indexActuel = 0;
let afficherMot = true;

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

  if (!manifest.cartes || !manifest.cartes.length) {
    signalerErreur('Cet ensemble ne contient aucune carte pour le moment.');
    return;
  }

  nomEnsembleEl.textContent = manifest.nom;
  initialiserSelecteurCartes(zoneSelecteur, manifest.cartes, slug, { min: 1, defaut: manifest.cartes.length });
}

boutonDemarrer.addEventListener('click', () => {
  const selection = lireSelectionCartes(zoneSelecteur, manifest.cartes);
  if (!selection.length) {
    erreurChargement.textContent = 'Choisissez au moins une carte avant de démarrer.';
    erreurChargement.hidden = false;
    return;
  }
  erreurChargement.hidden = true;
  pioche = melanger(selection);
  afficherMot = document.getElementById('case-afficher-mot').checked;
  indexActuel = 0;
  ecranConfig.hidden = true;
  ecranJeu.hidden = false;
  afficherCarteActuelle();
});

function afficherCarteActuelle() {
  const carte = pioche[indexActuel];
  imageCarte.src = urlImage(slug, carte.fichier);
  imageCarte.alt = carte.motAssocie || '';
  if (afficherMot && carte.motAssocie) {
    motCarte.textContent = carte.motAssocie;
    motCarte.hidden = false;
  } else {
    motCarte.hidden = true;
  }
  compteurCartes.textContent = (indexActuel + 1) + ' / ' + pioche.length;
  boutonPrecedent.disabled = indexActuel === 0;
  boutonSuivant.disabled = indexActuel === pioche.length - 1;
}

boutonPrecedent.addEventListener('click', () => {
  if (indexActuel > 0) {
    indexActuel--;
    afficherCarteActuelle();
  }
});

boutonSuivant.addEventListener('click', () => {
  if (indexActuel < pioche.length - 1) {
    indexActuel++;
    afficherCarteActuelle();
  }
});

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
