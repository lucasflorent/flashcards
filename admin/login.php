<?php
define('APP_INIT', true);
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

if (isAuthenticated()) {
    header('Location: index.php');
    exit;
}
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Connexion - Espace enseignant</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../assets/css/style.css?v=12">
</head>
<body class="page-admin">
<main class="conteneur-etroit">
  <h1>Espace enseignant</h1>
  <form id="form-login" class="carte-form">
    <label for="password">Mot de passe</label>
    <div class="champ-mot-de-passe">
      <input type="password" id="password" name="password" required autofocus autocomplete="current-password">
      <button type="button" id="toggle-password" class="btn-oeil" aria-label="Afficher le mot de passe" aria-pressed="false">
        <svg id="icone-oeil-ouvert" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <svg id="icone-oeil-barre" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" hidden>
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-3.22 4.53M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      </button>
    </div>
    <button type="submit">Se connecter</button>
    <p id="erreur-login" class="message-erreur" hidden></p>
  </form>
  <p><a href="../">← Retour à l'accueil</a></p>
</main>
<script>
const inputPassword = document.getElementById('password');
const boutonOeil = document.getElementById('toggle-password');
const iconeOuvert = document.getElementById('icone-oeil-ouvert');
const iconeBarre = document.getElementById('icone-oeil-barre');

boutonOeil.addEventListener('click', () => {
  const estVisible = inputPassword.type === 'text';
  inputPassword.type = estVisible ? 'password' : 'text';
  iconeOuvert.hidden = !estVisible;
  iconeBarre.hidden = estVisible;
  boutonOeil.setAttribute('aria-label', estVisible ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
  boutonOeil.setAttribute('aria-pressed', String(!estVisible));
});

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = inputPassword.value;
  const erreur = document.getElementById('erreur-login');
  erreur.hidden = true;
  try {
    const res = await fetch('../api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'password=' + encodeURIComponent(password)
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = 'index.php';
    } else {
      erreur.textContent = data.error || 'Erreur de connexion';
      erreur.hidden = false;
    }
  } catch (err) {
    erreur.textContent = 'Erreur réseau';
    erreur.hidden = false;
  }
});
</script>
</body>
</html>
