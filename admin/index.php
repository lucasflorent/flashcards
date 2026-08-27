<?php
define('APP_INIT', true);
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
requireAuth();

if (isset($_GET['logout'])) {
    logout();
    header('Location: login.php');
    exit;
}

$ensembles = readIndex();
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Mes ensembles - Espace enseignant</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../assets/css/style.css?v=12">
</head>
<body class="page-admin">
<header class="entete">
  <h1>Mes ensembles de flashcards</h1>
  <nav>
    <a href="../">Accueil</a>
    <a href="?logout=1">Se déconnecter</a>
  </nav>
</header>
<main class="conteneur">
  <section class="carte-form">
    <h2>Créer un nouvel ensemble</h2>
    <form id="form-creer">
      <label for="nom">Nom de l'ensemble</label>
      <input type="text" id="nom" name="nom" required placeholder="Ex : Vocabulaire des animaux" maxlength="100">
      <button type="submit">Créer</button>
      <p id="erreur-creer" class="message-erreur" hidden></p>
    </form>
  </section>

  <section>
    <h2>Ensembles existants</h2>
    <ul id="liste-ensembles" class="liste-ensembles">
      <?php foreach ($ensembles as $e): ?>
      <li>
        <a href="ensemble.php?slug=<?= htmlspecialchars($e['slug']) ?>"><?= htmlspecialchars($e['nom']) ?></a>
        <button class="btn-supprimer" data-slug="<?= htmlspecialchars($e['slug']) ?>" data-nom="<?= htmlspecialchars($e['nom']) ?>">Supprimer</button>
      </li>
      <?php endforeach; ?>
      <?php if (empty($ensembles)): ?>
      <li class="vide">Aucun ensemble pour l'instant. Créez-en un ci-dessus.</li>
      <?php endif; ?>
    </ul>
  </section>
</main>
<script src="../assets/js/admin-index.js?v=12"></script>
</body>
</html>
