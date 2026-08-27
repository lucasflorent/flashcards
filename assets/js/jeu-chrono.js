const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const champDuree = document.getElementById('champ-duree');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const imageCarte = document.getElementById('image-carte');
const motCarte = document.getElementById('mot-carte');
const barreChrono = document.getElementById('barre-chrono');
const minuteurTexte = document.getElementById('minuteur-texte');
const boutonPause = document.getElementById('bouton-pause');
const boutonSuivante = document.getElementById('bouton-suivante');
const compteurCartes = document.getElementById('compteur-cartes');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let pioche = [];
let indexActuel = 0;
let modeAffichage = 'both'; // 'both' | 'images' | 'mots'
let dureeParCarte = 5000;
let tempsRestant = 0;
let idIntervalle = null;
let idMinuteurFin = null;
let enPause = false;

function carteMontreImage(carte) {
  return modeAffichage !== 'mots' || !carte.motAssocie;
}

function carteMontreMot(carte) {
  return modeAffichage !== 'images' && !!carte.motAssocie;
}

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

  modeAffichage = document.querySelector('input[name="mode-affichage"]:checked').value;
  const duree = parseInt(champDuree.value, 10);
  dureeParCarte = (isNaN(duree) ? 5 : Math.max(2, Math.min(30, duree))) * 1000;

  pioche = melanger(selection);
  indexActuel = 0;
  boutonPause.disabled = false;
  boutonSuivante.disabled = false;

  ecranConfig.hidden = true;
  ecranJeu.hidden = false;
  demarrerCarte();
});

function demarrerCarte() {
  clearInterval(idIntervalle);
  clearTimeout(idMinuteurFin);
  enPause = false;
  boutonPause.textContent = 'Pause';

  const carte = pioche[indexActuel];
  if (carteMontreImage(carte)) {
    imageCarte.src = urlImage(slug, carte.fichier);
    imageCarte.alt = carte.motAssocie || '';
    imageCarte.hidden = false;
  } else {
    imageCarte.removeAttribute('src');
    imageCarte.hidden = true;
  }
  if (carteMontreMot(carte)) {
    motCarte.textContent = carte.motAssocie;
    motCarte.hidden = false;
  } else {
    motCarte.hidden = true;
  }
  compteurCartes.textContent = (indexActuel + 1) + ' / ' + pioche.length;

  tempsRestant = dureeParCarte;
  majBarre();
  idIntervalle = setInterval(tick, 100);
}

function tick() {
  tempsRestant -= 100;
  if (tempsRestant <= 0) {
    tempsRestant = 0;
    majBarre();
    clearInterval(idIntervalle);
    minuteurTexte.textContent = 'Temps écoulé !';
    idMinuteurFin = setTimeout(passerCarteSuivante, 800);
    return;
  }
  majBarre();
}

function majBarre() {
  const pourcentage = Math.max(0, (tempsRestant / dureeParCarte) * 100);
  barreChrono.style.width = pourcentage + '%';
  barreChrono.classList.toggle('urgent', pourcentage <= 25);
  minuteurTexte.textContent = Math.ceil(tempsRestant / 1000) + ' s';
}

function passerCarteSuivante() {
  if (indexActuel < pioche.length - 1) {
    indexActuel++;
    demarrerCarte();
  } else {
    clearInterval(idIntervalle);
    minuteurTexte.textContent = 'Manche terminée !';
    boutonPause.disabled = true;
    boutonSuivante.disabled = true;
  }
}

boutonPause.addEventListener('click', () => {
  if (enPause) {
    enPause = false;
    boutonPause.textContent = 'Pause';
    idIntervalle = setInterval(tick, 100);
  } else {
    enPause = true;
    boutonPause.textContent = 'Reprendre';
    clearInterval(idIntervalle);
  }
});

boutonSuivante.addEventListener('click', () => {
  passerCarteSuivante();
});

boutonRecommencer.addEventListener('click', () => {
  clearInterval(idIntervalle);
  clearTimeout(idMinuteurFin);
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
