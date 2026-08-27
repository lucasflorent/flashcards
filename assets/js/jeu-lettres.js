const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const grilleLettres = document.getElementById('grille-lettres');
const blocCorrection = document.getElementById('bloc-correction');
const selecteurMot = document.getElementById('selecteur-mot');
const boutonVerifier = document.getElementById('bouton-verifier');
const resultatCorrection = document.getElementById('resultat-correction');
const aucunMot = document.getElementById('aucun-mot');
const boutonNouvelleManche = document.getElementById('bouton-nouvelle-manche');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let cartesJeu = []; // { fichier, motAssocie, lettre }

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
    signalerErreur('Cet ensemble doit contenir au moins 2 cartes pour jouer à ce jeu.');
    return;
  }

  nomEnsembleEl.textContent = manifest.nom;
  initialiserSelecteurCartes(zoneSelecteur, manifest.cartes, slug, { min: 2, defaut: Math.min(10, manifest.cartes.length) });
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
  demarrerManche(selection);
});

function demarrerManche(selection) {
  const melange = melanger(selection);
  cartesJeu = melange.map((c, i) => ({ fichier: c.fichier, motAssocie: c.motAssocie, lettre: lettreDepuisIndex(i) }));
  construireGrille();
  construireCorrection();
}

function construireGrille() {
  grilleLettres.innerHTML = '';
  cartesJeu.forEach((carte) => {
    const div = document.createElement('div');
    div.className = 'carte-lettre';
    div.dataset.fichier = carte.fichier;
    div.innerHTML =
      '<img src="' + urlImage(slug, carte.fichier) + '" alt="">' +
      '<span class="lettre-carte">' + carte.lettre + '</span>';
    grilleLettres.appendChild(div);
  });
}

function construireCorrection() {
  resultatCorrection.hidden = true;
  const motsDisponibles = cartesJeu.filter((c) => c.motAssocie);

  if (!motsDisponibles.length) {
    blocCorrection.hidden = true;
    aucunMot.hidden = false;
    return;
  }

  aucunMot.hidden = true;
  blocCorrection.hidden = false;
  const motsTries = motsDisponibles.slice().sort((a, b) => a.motAssocie.localeCompare(b.motAssocie, 'fr'));
  selecteurMot.innerHTML = '<option value="">— Choisir le mot annoncé —</option>' +
    motsTries.map((c) => '<option value="' + echapperHtml(c.fichier) + '">' + echapperHtml(c.motAssocie) + '</option>').join('');
}

boutonVerifier.addEventListener('click', () => {
  grilleLettres.querySelectorAll('.carte-lettre.correcte').forEach((el) => el.classList.remove('correcte'));

  const fichierChoisi = selecteurMot.value;
  if (!fichierChoisi) {
    resultatCorrection.textContent = 'Choisissez un mot dans la liste.';
    resultatCorrection.hidden = false;
    return;
  }

  const carte = cartesJeu.find((c) => c.fichier === fichierChoisi);
  const cellule = grilleLettres.querySelector('[data-fichier="' + CSS.escape(fichierChoisi) + '"]');
  if (cellule) cellule.classList.add('correcte');
  resultatCorrection.textContent = 'Bonne lettre : ' + carte.lettre;
  resultatCorrection.hidden = false;
});

boutonNouvelleManche.addEventListener('click', () => {
  const selectionActuelle = cartesJeu.map((c) => ({ fichier: c.fichier, motAssocie: c.motAssocie }));
  demarrerManche(selectionActuelle);
});

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
