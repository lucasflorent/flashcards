// Fonctions communes aux pages de jeu (jeux/*.html).

function getParam(nom) {
  return new URLSearchParams(window.location.search).get(nom);
}

async function chargerEnsemble(slug) {
  const res = await fetch('../data/' + encodeURIComponent(slug) + '/manifest.json?_=' + Date.now());
  if (!res.ok) throw new Error('Ensemble introuvable');
  return res.json();
}

// Relie un curseur de pourcentage (présent dans l'en-tête de chaque page de
// jeu) à une variable CSS, et mémorise la valeur choisie pour les parties
// suivantes.
function initialiserCurseur(idCurseur, idValeur, variableCss, cleStockage) {
  const curseur = document.getElementById(idCurseur);
  if (!curseur) return;
  const affichageValeur = document.getElementById(idValeur);

  function appliquer(valeur) {
    document.documentElement.style.setProperty(variableCss, valeur / 100);
    if (affichageValeur) affichageValeur.textContent = valeur + ' %';
  }

  let valeurInitiale = parseInt(curseur.value, 10) || 100;
  try {
    const sauvegarde = localStorage.getItem(cleStockage);
    if (sauvegarde) valeurInitiale = parseInt(sauvegarde, 10) || valeurInitiale;
  } catch (err) {
    // stockage indisponible (navigation privée, etc.) : on ignore
  }

  curseur.value = valeurInitiale;
  appliquer(valeurInitiale);

  curseur.addEventListener('input', () => {
    const valeur = parseInt(curseur.value, 10);
    appliquer(valeur);
    try {
      localStorage.setItem(cleStockage, String(valeur));
    } catch (err) {
      // stockage indisponible : la préférence ne sera simplement pas mémorisée
    }
  });
}

function initialiserCurseurTaille() {
  initialiserCurseur('curseur-taille', 'valeur-taille', '--echelle-carte', 'flashcards-taille-images');
}

function initialiserCurseurTexte() {
  initialiserCurseur('curseur-texte', 'valeur-texte', '--echelle-texte', 'flashcards-taille-texte');
}

// Injecte une case "Afficher le tableau de scores" dans l'en-tête de la page
// et un panneau flottant à 2 équipes (score, nom éditable, réinitialisation).
// Visibilité, noms et scores sont mémorisés le temps de la session du
// navigateur (sessionStorage), pour suivre une équipe d'un jeu à l'autre.
const CLE_STOCKAGE_SCORES = 'flashcards-scores';

function initialiserTableauScores() {
  const entete = document.querySelector('.entete');
  if (!entete || document.getElementById('tableau-scores')) return;

  const labelCase = document.createElement('label');
  labelCase.className = 'option-checkbox option-checkbox-inline';
  labelCase.innerHTML = '<input type="checkbox" id="case-afficher-scores"> Tableau de scores';
  const nav = entete.querySelector('nav');
  entete.insertBefore(labelCase, nav);

  const panneau = document.createElement('div');
  panneau.id = 'tableau-scores';
  panneau.className = 'tableau-scores';
  panneau.hidden = true;
  panneau.innerHTML =
    '<div class="ligne-equipe">' +
      '<input type="text" class="nom-equipe" maxlength="20">' +
      '<button type="button" class="btn-score-moins" aria-label="Retirer un point">−</button>' +
      '<span class="valeur-score">0</span>' +
      '<button type="button" class="btn-score-plus" aria-label="Ajouter un point">+</button>' +
    '</div>' +
    '<div class="ligne-equipe">' +
      '<input type="text" class="nom-equipe" maxlength="20">' +
      '<button type="button" class="btn-score-moins" aria-label="Retirer un point">−</button>' +
      '<span class="valeur-score">0</span>' +
      '<button type="button" class="btn-score-plus" aria-label="Ajouter un point">+</button>' +
    '</div>' +
    '<button type="button" id="bouton-reinitialiser-scores">Réinitialiser les scores</button>';
  document.body.appendChild(panneau);

  function lireDonnees() {
    try {
      const brut = sessionStorage.getItem(CLE_STOCKAGE_SCORES);
      if (brut) return JSON.parse(brut);
    } catch (err) {
      // stockage indisponible : on repart de zéro
    }
    return null;
  }

  function ecrireDonnees(donnees) {
    try {
      sessionStorage.setItem(CLE_STOCKAGE_SCORES, JSON.stringify(donnees));
    } catch (err) {
      // stockage indisponible : les scores ne seront pas mémorisés
    }
  }

  const donnees = lireDonnees() || {
    visible: false,
    equipes: [
      { nom: 'Équipe A', score: 0 },
      { nom: 'Équipe B', score: 0 },
    ],
  };

  const caseAfficher = document.getElementById('case-afficher-scores');
  const lignes = panneau.querySelectorAll('.ligne-equipe');

  lignes.forEach((ligne, i) => {
    const champNom = ligne.querySelector('.nom-equipe');
    const spanScore = ligne.querySelector('.valeur-score');
    champNom.value = donnees.equipes[i].nom;
    spanScore.textContent = donnees.equipes[i].score;

    champNom.addEventListener('input', () => {
      donnees.equipes[i].nom = champNom.value;
      ecrireDonnees(donnees);
    });

    ligne.querySelector('.btn-score-plus').addEventListener('click', () => {
      donnees.equipes[i].score++;
      spanScore.textContent = donnees.equipes[i].score;
      ecrireDonnees(donnees);
    });

    ligne.querySelector('.btn-score-moins').addEventListener('click', () => {
      donnees.equipes[i].score--;
      spanScore.textContent = donnees.equipes[i].score;
      ecrireDonnees(donnees);
    });
  });

  document.getElementById('bouton-reinitialiser-scores').addEventListener('click', () => {
    donnees.equipes.forEach((e, i) => {
      e.score = 0;
      lignes[i].querySelector('.valeur-score').textContent = '0';
    });
    ecrireDonnees(donnees);
  });

  caseAfficher.checked = donnees.visible;
  panneau.hidden = !donnees.visible;

  caseAfficher.addEventListener('change', () => {
    donnees.visible = caseAfficher.checked;
    panneau.hidden = !caseAfficher.checked;
    ecrireDonnees(donnees);
  });
}

function melanger(tableau) {
  const copie = tableau.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copie[i];
    copie[i] = copie[j];
    copie[j] = tmp;
  }
  return copie;
}

// nombre : 'toutes' ou un entier
function tirerCartes(cartes, nombre) {
  const melange = melanger(cartes);
  if (nombre === 'toutes' || nombre >= melange.length) return melange;
  return melange.slice(0, nombre);
}

function urlImage(slug, fichier) {
  return '../data/' + encodeURIComponent(slug) + '/cartes/' + encodeURIComponent(fichier);
}

// A, B, ... Z, AA, AB, ... (comme les colonnes d'un tableur)
function lettreDepuisIndex(index) {
  let n = index + 1;
  let lettre = '';
  while (n > 0) {
    const reste = (n - 1) % 26;
    lettre = String.fromCharCode(65 + reste) + lettre;
    n = Math.floor((n - 1) / 26);
  }
  return lettre;
}

function echapperHtml(texte) {
  const div = document.createElement('div');
  div.textContent = texte || '';
  return div.innerHTML;
}

// Affiche un sélecteur de cartes dans conteneur : toutes / un nombre tiré au
// hasard / un choix précis (vignettes à cocher).
// options.min : plus petit nombre autorisé pour le mode "nombre précis" (ex. 4 pour le memory)
// options.pas : incrément du champ nombre (ex. 2 pour le memory)
function initialiserSelecteurCartes(conteneur, cartes, slug, options) {
  options = options || {};
  const min = options.min || 1;
  const pas = options.pas || 1;
  const total = cartes.length;
  const valeurDefaut = Math.min(options.defaut || 10, total);
  const desactiveNombre = total <= min;

  const vignettes = cartes.map((c, i) => (
    '<label class="vignette-carte">' +
      '<input type="checkbox" class="case-carte" value="' + i + '" checked>' +
      '<img src="' + urlImage(slug, c.fichier) + '" alt="' + echapperHtml(c.motAssocie) + '">' +
      (c.motAssocie ? '<span>' + echapperHtml(c.motAssocie) + '</span>' : '') +
    '</label>'
  )).join('');

  conteneur.innerHTML =
    '<fieldset class="selecteur-nombre">' +
      '<legend>Cartes à utiliser</legend>' +
      '<label class="option-radio"><input type="radio" name="mode-cartes" value="toutes" checked> Toutes les cartes (' + total + ')</label>' +
      '<label class="option-radio"><input type="radio" name="mode-cartes" value="nombre"' + (desactiveNombre ? ' disabled' : '') + '> Un nombre précis, tirées au hasard : ' +
        '<input type="number" id="nombre-precis" min="' + min + '" max="' + total + '" step="' + pas + '" value="' + valeurDefaut + '"' + (desactiveNombre ? ' disabled' : '') + '>' +
      '</label>' +
      '<label class="option-radio"><input type="radio" name="mode-cartes" value="choix"> Choisir les cartes précises</label>' +
      '<div id="bloc-choix-cartes" class="bloc-choix-cartes" hidden>' +
        '<div class="actions-choix-cartes">' +
          '<button type="button" id="bouton-tout-cocher">Tout cocher</button>' +
          '<button type="button" id="bouton-tout-decocher">Tout décocher</button>' +
        '</div>' +
        '<div class="grille-vignettes">' + vignettes + '</div>' +
      '</div>' +
    '</fieldset>';

  const blocChoix = conteneur.querySelector('#bloc-choix-cartes');
  conteneur.querySelectorAll('input[name="mode-cartes"]').forEach((r) => {
    r.addEventListener('change', () => {
      blocChoix.hidden = conteneur.querySelector('input[name="mode-cartes"]:checked').value !== 'choix';
    });
  });
  conteneur.querySelector('#bouton-tout-cocher').addEventListener('click', () => {
    conteneur.querySelectorAll('.case-carte').forEach((c) => { c.checked = true; });
  });
  conteneur.querySelector('#bouton-tout-decocher').addEventListener('click', () => {
    conteneur.querySelectorAll('.case-carte').forEach((c) => { c.checked = false; });
  });
}

// Renvoie le tableau des cartes sélectionnées selon le mode choisi (non mélangé).
function lireSelectionCartes(conteneur, cartes) {
  const mode = conteneur.querySelector('input[name="mode-cartes"]:checked').value;

  if (mode === 'toutes') return cartes.slice();

  if (mode === 'nombre') {
    const champ = conteneur.querySelector('#nombre-precis');
    let valeur = parseInt(champ.value, 10);
    const min = parseInt(champ.min, 10) || 1;
    if (isNaN(valeur)) valeur = cartes.length;
    valeur = Math.max(min, Math.min(valeur, cartes.length));
    return melanger(cartes).slice(0, valeur);
  }

  // mode === 'choix'
  const indices = Array.from(conteneur.querySelectorAll('.case-carte:checked')).map((c) => parseInt(c.value, 10));
  return indices.map((i) => cartes[i]);
}
