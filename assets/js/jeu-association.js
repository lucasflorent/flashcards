const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const motATrouver = document.getElementById('mot-a-trouver');
const messageAssociation = document.getElementById('message-association');
const boutonTirerMot = document.getElementById('bouton-tirer-mot');
const statutAssociation = document.getElementById('statut-association');
const grilleAssociation = document.getElementById('grille-association');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let cartesAvecMot = [];
let cartesJeu = []; // { fichier, motAssocie, trouvee }
let pioche = [];
let motActif = null;

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
  demarrerPartie(selection);
});

function demarrerPartie(selection) {
  cartesJeu = melanger(selection).map((c, i) => ({ fichier: c.fichier, motAssocie: c.motAssocie, lettre: lettreDepuisIndex(i), trouvee: false }));
  pioche = cartesJeu.slice();
  motActif = null;

  motATrouver.textContent = '—';
  messageAssociation.textContent = '';
  boutonTirerMot.disabled = false;
  construireGrille();
  majStatut();
}

function construireGrille() {
  grilleAssociation.innerHTML = '';
  cartesJeu.forEach((carte) => {
    const div = document.createElement('div');
    div.className = 'carte-lettre carte-association';
    div.dataset.fichier = carte.fichier;
    div.innerHTML =
      '<img src="' + urlImage(slug, carte.fichier) + '" alt="">' +
      '<span class="lettre-carte">' + carte.lettre + '</span>';
    div.addEventListener('click', () => cliquerCarte(carte.fichier, div));
    grilleAssociation.appendChild(div);
  });
}

function majStatut() {
  const trouvees = cartesJeu.filter((c) => c.trouvee).length;
  statutAssociation.textContent = 'Images associées : ' + trouvees + ' / ' + cartesJeu.length;
}

boutonTirerMot.addEventListener('click', () => {
  if (!pioche.length) return;
  const index = Math.floor(Math.random() * pioche.length);
  motActif = pioche.splice(index, 1)[0];
  motATrouver.textContent = motActif.motAssocie;
  messageAssociation.textContent = '';
  if (!pioche.length) boutonTirerMot.disabled = true;
});

function cliquerCarte(fichier, element) {
  if (!motActif) {
    messageAssociation.textContent = 'Tirez d\'abord un mot.';
    return;
  }
  if (element.classList.contains('trouvee')) return;

  if (fichier === motActif.fichier) {
    element.classList.add('trouvee');
    const carte = cartesJeu.find((c) => c.fichier === fichier);
    carte.trouvee = true;
    messageAssociation.textContent = 'Bravo ! Bonne lettre : ' + carte.lettre;
    motActif = null;
    motATrouver.textContent = '—';
    majStatut();
    if (cartesJeu.every((c) => c.trouvee)) {
      messageAssociation.textContent = 'Toutes les images ont été associées !';
    }
  } else {
    element.classList.add('erreur');
    setTimeout(() => element.classList.remove('erreur'), 500);
  }
}

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
