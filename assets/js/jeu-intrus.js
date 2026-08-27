const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const consigneJeu = document.getElementById('consigne-jeu');
const grilleIntrus = document.getElementById('grille-intrus');
const blocReponse = document.getElementById('bloc-reponse');
const imageReponse = document.getElementById('image-reponse');
const motReponse = document.getElementById('mot-reponse');
const boutonEtape = document.getElementById('bouton-etape');
const boutonRejouer = document.getElementById('bouton-rejouer');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let selectionActuelle = [];
let cartesRestantes = [];
let carteRetiree = null;
let phase = 'presentation'; // 'presentation' | 'transition' | 'devinette' | 'revelee'
let idMinuteurTransition = null;

initialiserCurseurTaille();
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

  if (!manifest.cartes || manifest.cartes.length < 3) {
    signalerErreur('Cet ensemble doit contenir au moins 3 cartes pour jouer à ce jeu.');
    return;
  }

  nomEnsembleEl.textContent = manifest.nom;
  initialiserSelecteurCartes(zoneSelecteur, manifest.cartes, slug, { min: 3, defaut: Math.min(8, manifest.cartes.length) });
}

boutonDemarrer.addEventListener('click', () => {
  const selection = lireSelectionCartes(zoneSelecteur, manifest.cartes);
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
  clearTimeout(idMinuteurTransition);
  phase = 'presentation';
  carteRetiree = null;
  cartesRestantes = [];
  blocReponse.hidden = true;
  boutonRejouer.hidden = true;
  boutonEtape.hidden = false;
  boutonEtape.disabled = false;
  boutonEtape.textContent = 'Cacher et retirer une carte';
  consigneJeu.textContent = 'Observez bien ces ' + selectionActuelle.length + ' cartes...';
  construireGrille(melanger(selectionActuelle), false);
}

// La classe .retournee du composant .carte-flip affiche la face-image ;
// son absence affiche la face-dos ("?"). "cachees" doit donc omettre la classe.
function construireGrille(cartes, cachees) {
  grilleIntrus.innerHTML = '';
  cartes.forEach((carte) => {
    const div = document.createElement('div');
    div.className = 'carte-flip' + (cachees ? '' : ' retournee');
    div.innerHTML =
      '<span class="interieur-carte">' +
        '<span class="face face-dos">?</span>' +
        '<span class="face face-image"><img src="' + urlImage(slug, carte.fichier) + '" alt=""></span>' +
      '</span>';
    grilleIntrus.appendChild(div);
  });
}

boutonEtape.addEventListener('click', () => {
  if (phase === 'presentation') {
    const melange = melanger(selectionActuelle);
    const indexRetire = Math.floor(Math.random() * melange.length);
    carteRetiree = melange[indexRetire];
    cartesRestantes = melange.filter((_, i) => i !== indexRetire);

    // Cache brièvement les cartes restantes (effet de mélange), puis les
    // remontre face visible pour que les élèves cherchent la carte manquante.
    construireGrille(cartesRestantes, true);
    consigneJeu.textContent = 'Les cartes sont mélangées...';
    boutonEtape.disabled = true;
    phase = 'transition';

    idMinuteurTransition = setTimeout(() => {
      construireGrille(cartesRestantes, false);
      consigneJeu.textContent = 'Une carte a disparu ! Laquelle ? (' + cartesRestantes.length + ' cartes restantes sur ' + selectionActuelle.length + ')';
      boutonEtape.textContent = 'Révéler la réponse';
      boutonEtape.disabled = false;
      phase = 'devinette';
    }, 2000);
    return;
  }

  if (phase === 'devinette') {
    imageReponse.src = urlImage(slug, carteRetiree.fichier);
    imageReponse.alt = carteRetiree.motAssocie || '';
    if (carteRetiree.motAssocie) {
      motReponse.textContent = carteRetiree.motAssocie;
      motReponse.hidden = false;
    } else {
      motReponse.hidden = true;
    }
    blocReponse.hidden = false;

    construireGrille(cartesRestantes, false);
    consigneJeu.textContent = 'Voici la carte qui manquait.';
    boutonEtape.hidden = true;
    boutonRejouer.hidden = false;
    phase = 'revelee';
  }
});

boutonRejouer.addEventListener('click', () => {
  demarrerManche();
});

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
