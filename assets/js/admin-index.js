const formCreer = document.getElementById('form-creer');
const erreurCreer = document.getElementById('erreur-creer');

formCreer.addEventListener('submit', async (e) => {
  e.preventDefault();
  erreurCreer.hidden = true;
  const nom = document.getElementById('nom').value.trim();
  if (!nom) return;

  const bouton = formCreer.querySelector('button[type="submit"]');
  bouton.disabled = true;
  try {
    const res = await fetch('../api/sets.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'action=create&nom=' + encodeURIComponent(nom)
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = 'ensemble.php?slug=' + encodeURIComponent(data.slug);
    } else {
      erreurCreer.textContent = data.error || 'Erreur lors de la création';
      erreurCreer.hidden = false;
    }
  } catch (err) {
    erreurCreer.textContent = 'Erreur réseau';
    erreurCreer.hidden = false;
  } finally {
    bouton.disabled = false;
  }
});

document.querySelectorAll('.btn-supprimer').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const slug = btn.dataset.slug;
    const nom = btn.dataset.nom;
    if (!confirm('Supprimer l\'ensemble "' + nom + '" et toutes ses cartes ? Cette action est irréversible.')) return;

    btn.disabled = true;
    try {
      const res = await fetch('../api/sets.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=delete&slug=' + encodeURIComponent(slug)
      });
      const data = await res.json();
      if (data.success) {
        btn.closest('li').remove();
      } else {
        alert(data.error || 'Erreur lors de la suppression');
        btn.disabled = false;
      }
    } catch (err) {
      alert('Erreur réseau');
      btn.disabled = false;
    }
  });
});
