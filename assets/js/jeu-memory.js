const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const grilleMemory = document.getElementById('grille-memory');
const statutJeu = document.getElementById('statut-jeu');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let cartesJeu = []; // { fichier, motAssocie, etat: 'cachee' | 'retournee' | 'trouvee' }
let indicesRetournes = [];
let paireTrouvees = 0;
let totalPaires = 0;
let enPause = false;

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
    signalerErreur('Cet ensemble doit contenir au moins 2 cartes différentes pour jouer au memory.');
    return;
  }

  nomEnsembleEl.textContent = manifest.nom;
  initialiserSelecteurCartes(zoneSelecteur, manifest.cartes, slug, { min: 2, defaut: Math.min(8, manifest.cartes.length) });
}

boutonDemarrer.addEventListener('click', () => {
  const selection = lireSelectionCartes(zoneSelecteur, manifest.cartes);
  if (selection.length < 2) {
    erreurChargement.textContent = 'Choisissez au moins 2 cartes différentes.';
    erreurChargement.hidden = false;
    return;
  }
  erreurChargement.hidden = true;
  demarrerPartie(selection);
});

function demarrerPartie(selection) {
  totalPaires = selection.length;
  paireTrouvees = 0;
  indicesRetournes = [];
  enPause = false;

  const doublees = selection.flatMap((c) => [c, c]);
  cartesJeu = melanger(doublees).map((c) => ({ fichier: c.fichier, motAssocie: c.motAssocie, etat: 'cachee' }));

  ecranConfig.hidden = true;
  ecranJeu.hidden = false;
  construireGrille();
  majStatut();
}

function construireGrille() {
  grilleMemory.innerHTML = '';
  cartesJeu.forEach((carte, index) => {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'carte-flip';
    bouton.dataset.index = String(index);
    bouton.setAttribute('aria-label', 'Carte cachée');
    bouton.innerHTML =
      '<span class="interieur-carte">' +
        '<span class="face face-dos">?</span>' +
        '<span class="face face-image"><img src="' + urlImage(slug, carte.fichier) + '" alt=""></span>' +
      '</span>';
    bouton.addEventListener('click', () => retournerCarte(index));
    grilleMemory.appendChild(bouton);
  });
}

function retournerCarte(index) {
  if (enPause) return;
  const carte = cartesJeu[index];
  if (carte.etat !== 'cachee') return;
  if (indicesRetournes.length >= 2) return;

  carte.etat = 'retournee';
  majApparenceCarte(index);
  indicesRetournes.push(index);

  if (indicesRetournes.length === 2) {
    const [i1, i2] = indicesRetournes;
    if (cartesJeu[i1].fichier === cartesJeu[i2].fichier) {
      enPause = true;
      setTimeout(() => {
        cartesJeu[i1].etat = 'trouvee';
        cartesJeu[i2].etat = 'trouvee';
        majApparenceCarte(i1);
        majApparenceCarte(i2);
        indicesRetournes = [];
        paireTrouvees++;
        enPause = false;
        if (paireTrouvees === totalPaires) {
          statutJeu.textContent = 'Bravo ! Toutes les paires ont été trouvées (' + totalPaires + ' / ' + totalPaires + ').';
        } else {
          majStatut();
        }
      }, 600);
    } else {
      enPause = true;
      setTimeout(() => {
        cartesJeu[i1].etat = 'cachee';
        cartesJeu[i2].etat = 'cachee';
        majApparenceCarte(i1);
        majApparenceCarte(i2);
        indicesRetournes = [];
        enPause = false;
      }, 1000);
    }
  }
}

function majApparenceCarte(index) {
  const bouton = grilleMemory.querySelector('[data-index="' + index + '"]');
  if (!bouton) return;
  const carte = cartesJeu[index];
  bouton.classList.toggle('retournee', carte.etat !== 'cachee');
  bouton.classList.toggle('trouvee', carte.etat === 'trouvee');
  bouton.disabled = carte.etat === 'trouvee';
  bouton.setAttribute('aria-label', carte.etat === 'cachee' ? 'Carte cachée' : (carte.motAssocie || 'Carte retournée'));
}

function majStatut() {
  statutJeu.textContent = 'Paires trouvées : ' + paireTrouvees + ' / ' + totalPaires;
}

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
