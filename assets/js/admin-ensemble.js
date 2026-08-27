const conteneur = document.querySelector('main.conteneur');
const slug = conteneur.dataset.slug;

const inputImage = document.getElementById('image');
const blocApercu = document.getElementById('bloc-apercu');
const form = document.getElementById('form-upload');
const statut = document.getElementById('statut-upload');
const boutonEnvoi = form.querySelector('button[type="submit"]');
const libelleBoutonInitial = boutonEnvoi.textContent;
let filesAPreparer = []; // { blob, nomOriginal }

function afficherApercus() {
  blocApercu.innerHTML = '';
  if (!filesAPreparer.length) {
    blocApercu.hidden = true;
    return;
  }
  const info = document.createElement('p');
  info.className = 'aide';
  info.textContent = filesAPreparer.length + ' carte(s) prête(s) à être ajoutée(s) :';
  blocApercu.appendChild(info);

  const grille = document.createElement('ul');
  grille.className = 'grille-apercus';
  filesAPreparer.forEach((item, index) => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = URL.createObjectURL(item.blob);
    img.alt = item.nomOriginal;
    const retirer = document.createElement('button');
    retirer.type = 'button';
    retirer.textContent = 'Retirer';
    retirer.className = 'btn-suppr-carte';
    retirer.addEventListener('click', () => {
      filesAPreparer.splice(index, 1);
      afficherApercus();
    });
    li.appendChild(img);
    li.appendChild(retirer);
    grille.appendChild(li);
  });
  blocApercu.appendChild(grille);
  blocApercu.hidden = false;
}

inputImage.addEventListener('change', async () => {
  statut.hidden = true;
  filesAPreparer = [];
  const fichiers = Array.from(inputImage.files || []);
  for (const file of fichiers) {
    try {
      const blob = await imageToSquareJpeg(file);
      filesAPreparer.push({ blob, nomOriginal: file.name });
    } catch (err) {
      statut.textContent = 'Certaines images n\'ont pas pu être lues et ont été ignorées.';
      statut.hidden = false;
    }
  }
  afficherApercus();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!filesAPreparer.length) {
    statut.textContent = 'Choisissez au moins une image.';
    statut.hidden = false;
    return;
  }
  statut.hidden = true;

  boutonEnvoi.disabled = true;
  let reussites = 0;
  const echecs = [];

  for (let i = 0; i < filesAPreparer.length; i++) {
    boutonEnvoi.textContent = 'Envoi ' + (i + 1) + ' / ' + filesAPreparer.length + '...';
    const fd = new FormData();
    fd.append('slug', slug);
    fd.append('motAssocie', '');
    fd.append('image', filesAPreparer[i].blob, 'carte.jpg');
    try {
      const res = await fetch('../api/upload.php', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        reussites++;
      } else {
        echecs.push(filesAPreparer[i].nomOriginal + ' : ' + (data.error || 'erreur inconnue'));
      }
    } catch (err) {
      echecs.push(filesAPreparer[i].nomOriginal + ' : erreur réseau');
    }
  }

  if (echecs.length) {
    statut.textContent = reussites + ' carte(s) ajoutée(s). Échecs : ' + echecs.join(', ');
    statut.hidden = false;
    boutonEnvoi.disabled = false;
    boutonEnvoi.textContent = libelleBoutonInitial;
  } else {
    window.location.reload();
  }
});

async function envoyerActionCarte(action, params) {
  const body = new URLSearchParams();
  body.append('action', action);
  body.append('slug', slug);
  Object.keys(params || {}).forEach((key) => {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach((v) => body.append(key, v));
    } else {
      body.append(key, value);
    }
  });
  const res = await fetch('../api/cards.php', { method: 'POST', body });
  return res.json();
}

function listeFichiersActuelle() {
  return Array.from(document.querySelectorAll('#liste-cartes li')).map((li) => li.dataset.fichier);
}

function majCompteEtVide() {
  const n = document.querySelectorAll('#liste-cartes li').length;
  document.getElementById('compte-cartes').textContent = n;
  document.getElementById('liste-vide').hidden = n > 0;
}

document.getElementById('liste-cartes').addEventListener('click', async (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const fichier = li.dataset.fichier;

  if (e.target.classList.contains('btn-suppr-carte')) {
    if (!confirm('Supprimer cette carte ?')) return;
    const data = await envoyerActionCarte('delete', { fichier });
    if (data.success) {
      li.remove();
      majCompteEtVide();
    } else {
      alert(data.error || 'Erreur');
    }
  }

  if (e.target.classList.contains('btn-monter')) {
    const prec = li.previousElementSibling;
    if (prec) {
      li.parentNode.insertBefore(li, prec);
      await envoyerActionCarte('reorder', { 'ordre[]': listeFichiersActuelle() });
    }
  }

  if (e.target.classList.contains('btn-descendre')) {
    const suiv = li.nextElementSibling;
    if (suiv) {
      li.parentNode.insertBefore(suiv, li);
      await envoyerActionCarte('reorder', { 'ordre[]': listeFichiersActuelle() });
    }
  }
});

document.getElementById('liste-cartes').addEventListener('blur', async (e) => {
  if (!e.target.classList.contains('champ-mot')) return;
  const li = e.target.closest('li');
  const fichier = li.dataset.fichier;
  await envoyerActionCarte('update', { fichier: fichier, motAssocie: e.target.value.trim() });
}, true);
