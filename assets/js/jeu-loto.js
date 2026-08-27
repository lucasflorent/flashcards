const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const imageTirage = document.getElementById('image-tirage');
const motTirage = document.getElementById('mot-tirage');
const messageTirage = document.getElementById('message-tirage');
const boutonTirer = document.getElementById('bouton-tirer');
const grilleLoto = document.getElementById('grille-loto');
const compteTirees = document.getElementById('compte-tirees');
const compteTotal = document.getElementById('compte-total');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let cartesJeu = [];
let pioche = [];
let modeAffichage = 'both'; // 'both' | 'images' | 'mots'

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

  if (!manifest.cartes || manifest.cartes.length < 2) {
    signalerErreur('Cet ensemble doit contenir au moins 2 cartes pour jouer au loto.');
    return;
  }

  nomEnsembleEl.textContent = manifest.nom;
  initialiserSelecteurCartes(zoneSelecteur, manifest.cartes, slug, { min: 2, defaut: Math.min(15, manifest.cartes.length) });
}

boutonDemarrer.addEventListener('click', () => {
  const selection = lireSelectionCartes(zoneSelecteur, manifest.cartes);
  if (selection.length < 2) {
    erreurChargement.textContent = 'Choisissez au moins 2 cartes différentes.';
    erreurChargement.hidden = false;
    return;
  }
  erreurChargement.hidden = true;
  ecranConfig.hidden = true;
  ecranJeu.hidden = false;
  demarrerPartie(selection);
});

function demarrerPartie(selection) {
  modeAffichage = document.querySelector('input[name="mode-affichage"]:checked').value;
  cartesJeu = melanger(selection).map((c) => ({ fichier: c.fichier, motAssocie: c.motAssocie }));
  pioche = cartesJeu.slice();

  compteTotal.textContent = String(cartesJeu.length);
  compteTirees.textContent = '0';
  imageTirage.removeAttribute('src');
  imageTirage.alt = '';
  imageTirage.hidden = true;
  motTirage.hidden = true;
  messageTirage.textContent = 'Cliquez sur "Tirer une carte" pour commencer.';
  boutonTirer.disabled = false;
  construireGrille();
}

function construireGrille() {
  grilleLoto.innerHTML = '';
  cartesJeu.forEach((carte) => {
    const montreImage = carteMontreImage(carte);
    const montreMot = carteMontreMot(carte);
    const div = document.createElement('div');
    div.className = 'carte-lettre carte-loto' + (!montreImage ? ' mot-seul' : '');
    div.dataset.fichier = carte.fichier;
    div.innerHTML =
      (montreImage ? '<img src="' + urlImage(slug, carte.fichier) + '" alt="">' : '') +
      (montreMot ? '<span class="lettre-carte lettre-carte-mot">' + echapperHtml(carte.motAssocie) + '</span>' : '');
    grilleLoto.appendChild(div);
  });
}

boutonTirer.addEventListener('click', () => {
  if (!pioche.length) return;

  const index = Math.floor(Math.random() * pioche.length);
  const carte = pioche.splice(index, 1)[0];

  if (carteMontreImage(carte)) {
    imageTirage.src = urlImage(slug, carte.fichier);
    imageTirage.alt = carte.motAssocie || '';
    imageTirage.hidden = false;
  } else {
    imageTirage.removeAttribute('src');
    imageTirage.hidden = true;
  }

  if (carteMontreMot(carte)) {
    motTirage.textContent = carte.motAssocie;
    motTirage.hidden = false;
  } else {
    motTirage.hidden = true;
  }

  const cellule = grilleLoto.querySelector('[data-fichier="' + CSS.escape(carte.fichier) + '"]');
  if (cellule) cellule.classList.add('tiree');

  compteTirees.textContent = String(cartesJeu.length - pioche.length);

  if (!pioche.length) {
    messageTirage.textContent = 'Toutes les cartes ont été tirées !';
    boutonTirer.disabled = true;
  } else {
    messageTirage.textContent = '';
  }
});

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
