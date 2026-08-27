const slug = getParam('set');
const nomEnsembleEl = document.getElementById('nom-ensemble');
const zoneSelecteur = document.getElementById('zone-selecteur');
const champEssais = document.getElementById('champ-essais');
const boutonDemarrer = document.getElementById('bouton-demarrer');
const erreurChargement = document.getElementById('erreur-chargement');
const ecranConfig = document.getElementById('ecran-configuration');
const ecranJeu = document.getElementById('ecran-jeu');
const imageCarte = document.getElementById('image-carte');
const motPenduEl = document.getElementById('mot-pendu');
const pipsEssais = document.getElementById('pips-essais');
const texteEssais = document.getElementById('texte-essais');
const messagePendu = document.getElementById('message-pendu');
const clavierPendu = document.getElementById('clavier-pendu');
const boutonMotSuivant = document.getElementById('bouton-mot-suivant');
const boutonRecommencer = document.getElementById('bouton-recommencer');
const lienRetour = document.getElementById('lien-retour');

let manifest = null;
let cartesAvecMot = [];
let pioche = [];
let essaisInitiaux = 6;
let essaisRestants = 6;
let etatLettres = [];
let jeuTermine = false;

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
  if (cartesAvecMot.length < 1) {
    signalerErreur('Ce jeu nécessite au moins une carte avec un mot associé renseigné (à ajouter depuis l\'espace enseignant).');
    return;
  }

  nomEnsembleEl.textContent = manifest.nom;
  initialiserSelecteurCartes(zoneSelecteur, cartesAvecMot, slug, { min: 1, defaut: cartesAvecMot.length });
}

boutonDemarrer.addEventListener('click', () => {
  const selection = lireSelectionCartes(zoneSelecteur, cartesAvecMot);
  if (!selection.length) {
    erreurChargement.textContent = 'Choisissez au moins une carte avant de démarrer.';
    erreurChargement.hidden = false;
    return;
  }
  erreurChargement.hidden = true;

  const valeur = parseInt(champEssais.value, 10);
  essaisInitiaux = isNaN(valeur) ? 6 : Math.max(3, Math.min(10, valeur));

  pioche = melanger(selection);
  ecranConfig.hidden = true;
  ecranJeu.hidden = false;
  demarrerMot();
});

function estLettreDevinable(car) {
  return /[a-zA-Z]/.test(car);
}

function demarrerMot() {
  if (!pioche.length) {
    motPenduEl.textContent = '';
    imageCarte.hidden = true;
    messagePendu.textContent = 'Tous les mots ont été devinés !';
    boutonMotSuivant.disabled = true;
    clavierPendu.innerHTML = '';
    pipsEssais.innerHTML = '';
    texteEssais.textContent = '';
    return;
  }

  const carte = pioche.shift();
  const mot = carte.motAssocie;

  etatLettres = mot.split('').map((car) => ({
    car,
    devinable: estLettreDevinable(car),
    revele: !estLettreDevinable(car),
  }));

  jeuTermine = false;
  essaisRestants = essaisInitiaux;
  imageCarte.src = urlImage(slug, carte.fichier);
  imageCarte.alt = mot;
  imageCarte.hidden = true;
  messagePendu.textContent = '';
  boutonMotSuivant.disabled = false;

  afficherMotPendu();
  majEssais();
  construireClavier();
}

function afficherMotPendu() {
  motPenduEl.textContent = etatLettres
    .map((e) => (e.revele ? e.car : '_'))
    .join(' ');
}

function majEssais() {
  texteEssais.textContent = 'Essais restants : ' + essaisRestants + ' / ' + essaisInitiaux;
  pipsEssais.innerHTML = '';
  for (let i = 0; i < essaisInitiaux; i++) {
    const pip = document.createElement('span');
    pip.className = 'pip' + (i < essaisRestants ? ' plein' : '');
    pipsEssais.appendChild(pip);
  }
}

function construireClavier() {
  clavierPendu.innerHTML = '';
  for (let i = 0; i < 26; i++) {
    const lettre = String.fromCharCode(65 + i);
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'touche-pendu';
    bouton.textContent = lettre;
    bouton.addEventListener('click', () => cliquerLettre(lettre, bouton));
    clavierPendu.appendChild(bouton);
  }
}

function cliquerLettre(lettre, bouton) {
  if (jeuTermine || bouton.disabled) return;
  bouton.disabled = true;

  const trouve = etatLettres.some((e) => e.devinable && e.car.toUpperCase() === lettre);

  if (trouve) {
    etatLettres.forEach((e) => {
      if (e.devinable && e.car.toUpperCase() === lettre) e.revele = true;
    });
    bouton.classList.add('correcte');
    afficherMotPendu();
    if (etatLettres.every((e) => e.revele)) {
      gagner();
    }
  } else {
    bouton.classList.add('incorrecte');
    essaisRestants--;
    majEssais();
    if (essaisRestants <= 0) {
      perdre();
    }
  }
}

function terminerClavier() {
  clavierPendu.querySelectorAll('.touche-pendu').forEach((b) => { b.disabled = true; });
}

function gagner() {
  jeuTermine = true;
  terminerClavier();
  imageCarte.hidden = false;
  messagePendu.textContent = 'Bravo, le mot est trouvé !';
  messagePendu.className = 'statut-jeu reponse-vraie';
}

function perdre() {
  jeuTermine = true;
  terminerClavier();
  etatLettres.forEach((e) => { e.revele = true; });
  afficherMotPendu();
  imageCarte.hidden = false;
  messagePendu.textContent = 'Perdu ! Le mot était : ' + etatLettres.map((e) => e.car).join('');
  messagePendu.className = 'statut-jeu reponse-fausse';
}

boutonMotSuivant.addEventListener('click', () => {
  demarrerMot();
});

boutonRecommencer.addEventListener('click', () => {
  ecranJeu.hidden = true;
  ecranConfig.hidden = false;
});

init();
