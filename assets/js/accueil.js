const listeEnsembles = document.getElementById('liste-ensembles');
const aucunEnsemble = document.getElementById('aucun-ensemble');
const ecranEnsembles = document.getElementById('ecran-ensembles');
const ecranJeux = document.getElementById('ecran-jeux');
const nomEnsembleChoisi = document.getElementById('nom-ensemble-choisi');
const lienChanger = document.getElementById('lien-changer-ensemble');
const boutonsJeu = document.querySelectorAll('.bouton-jeu');

async function chargerEnsembles() {
  try {
    const res = await fetch('data/index.json?_=' + Date.now());
    const ensembles = res.ok ? await res.json() : [];
    if (!ensembles.length) {
      aucunEnsemble.textContent = 'Aucun ensemble disponible pour le moment.';
      aucunEnsemble.hidden = false;
      return;
    }
    ensembles.forEach((e) => {
      const li = document.createElement('li');
      const bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.textContent = e.nom;
      bouton.className = 'bouton-ensemble';
      bouton.addEventListener('click', () => choisirEnsemble(e));
      li.appendChild(bouton);
      listeEnsembles.appendChild(li);
    });

    const slugPrechoisi = new URLSearchParams(window.location.search).get('set');
    if (slugPrechoisi) {
      const ensemblePrechoisi = ensembles.find((e) => e.slug === slugPrechoisi);
      if (ensemblePrechoisi) choisirEnsemble(ensemblePrechoisi);
    }
  } catch (err) {
    aucunEnsemble.textContent = 'Impossible de charger les ensembles.';
    aucunEnsemble.hidden = false;
  }
}

function choisirEnsemble(ensemble) {
  nomEnsembleChoisi.textContent = ensemble.nom;
  boutonsJeu.forEach((a) => {
    a.href = a.dataset.jeu + '?set=' + encodeURIComponent(ensemble.slug);
  });
  ecranEnsembles.hidden = true;
  ecranJeux.hidden = false;
}

lienChanger.addEventListener('click', (e) => {
  e.preventDefault();
  ecranJeux.hidden = true;
  ecranEnsembles.hidden = false;
});

chargerEnsembles();
