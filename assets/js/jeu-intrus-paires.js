const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const messageIntrus = document.getElementById('message-intrus');
const grilleIntrusPaires = document.getElementById('grille-intrus-paires');
const boutonReveler = document.getElementById('bouton-reveler');
const boutonNouvelleGrille = document.getElementById('bouton-nouvelle-grille');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let cartesAvecMot = [];
let selectionActuelle = [];
let cartesJeu = []; // { fichier, motReel, motAffiche, estIntrus }
let trouve = false;

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
  if (cartesAvecMot.length < 3) {
    signalerErreur('Ce jeu nécessite au moins 3 cartes avec un mot associé renseigné (à ajouter depuis l\'espace enseignant).');
    return;
  }

  nomEnsembleEl.textContent = manifest.nom;
  initialiserSelecteurCartes(zoneSelecteur, cartesAvecMot, slug, { min: 3, defaut: Math.min(6, cartesAvecMot.length) });
}

boutonDemarrer.addEventListener('click', () => {
  const selection = lireSelectionCartes(zoneSelecteur, cartesAvecMot);
  if (selection.length < 3) {
    erreurChargement.textContent = 'Choisissez au moins 3 cartes différentes.';
    erreurChargement.hidden = false;
    return;
  }
  erreurChargement.hidden = true;
  selectionActuelle = selection;
  ecranConfig.hidden = true;
  ecranJeu.hidden = false;
  demarrerManche();
});

function demarrerManche() {
  const melange = melanger(selectionActuelle);
  const indexIntrus = Math.floor(Math.random() * melange.length);
  let indexEmprunt = Math.floor(Math.random() * melange.length);
  while (indexEmprunt === indexIntrus) {
    indexEmprunt = Math.floor(Math.random() * melange.length);
  }

  cartesJeu = melange.map((c, i) => ({
    fichier: c.fichier,
    motReel: c.motAssocie,
    motAffiche: i === indexIntrus ? melange[indexEmprunt].motAssocie : c.motAssocie,
    estIntrus: i === indexIntrus,
  }));

  trouve = false;
  messageIntrus.textContent = '';
  boutonReveler.disabled = false;
  construireGrille();
}

function construireGrille() {
  grilleIntrusPaires.innerHTML = '';
  cartesJeu.forEach((carte, i) => {
    const div = document.createElement('div');
    div.className = 'carte-lettre carte-association';
    div.innerHTML =
      '<img src="' + urlImage(slug, carte.fichier) + '" alt="">' +
      '<span class="lettre-carte lettre-carte-mot">' + echapperHtml(carte.motAffiche) + '</span>';
    div.addEventListener('click', () => cliquerPaire(i, div));
    grilleIntrusPaires.appendChild(div);
  });
}

function cliquerPaire(index, element) {
  if (trouve) return;

  if (cartesJeu[index].estIntrus) {
    trouve = true;
    element.classList.add('trouvee');
    messageIntrus.textContent = 'Bravo ! C\'était bien l\'intrus (le bon mot était : ' + cartesJeu[index].motReel + ').';
    boutonReveler.disabled = true;
  } else {
    element.classList.add('erreur');
    setTimeout(() => element.classList.remove('erreur'), 500);
  }
}

boutonReveler.addEventListener('click', () => {
  if (trouve) return;
  trouve = true;
  const index = cartesJeu.findIndex((c) => c.estIntrus);
  const element = grilleIntrusPaires.children[index];
  if (element) element.classList.add('trouvee');
  messageIntrus.textContent = 'L\'intrus était celui-ci (le bon mot était : ' + cartesJeu[index].motReel + ').';
  boutonReveler.disabled = true;
});

boutonNouvelleGrille.addEventListener('click', () => {
  demarrerManche();
});

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
