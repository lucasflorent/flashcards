<?php
define('APP_INIT', true);
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
requireAuth();

$slug = $_GET['slug'] ?? '';
if (!isValidSlug($slug)) {
    header('Location: index.php');
    exit;
}
$manifest = readManifest($slug);
if ($manifest === null) {
    header('Location: index.php');
    exit;
}
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title><?= htmlspecialchars($manifest['nom']) ?> - Espace enseignant</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../assets/css/style.css?v=12">
</head>
<body class="page-admin">
<header class="entete">
  <h1><?= htmlspecialchars($manifest['nom']) ?></h1>
  <nav>
    <a href="index.php">← Mes ensembles</a>
  </nav>
</header>
<main class="conteneur" data-slug="<?= htmlspecialchars($slug) ?>">
  <section class="carte-form">
    <h2>Ajouter une carte</h2>
    <form id="form-upload">
      <label for="image">Images (JPG) — vous pouvez en sélectionner plusieurs à la fois</label>
      <input type="file" id="image" name="image" accept="image/jpeg" multiple>
      <p class="aide">Le mot associé à chaque carte pourra être renseigné ensuite, directement dans la liste ci-dessous.</p>
      <div id="bloc-apercu" hidden></div>
      <button type="submit">Ajouter les cartes</button>
      <p id="statut-upload" class="message-erreur" hidden></p>
    </form>
  </section>

  <section>
    <h2>Cartes (<span id="compte-cartes"><?= count($manifest['cartes']) ?></span>)</h2>
    <ul id="liste-cartes" class="grille-cartes-admin">
      <?php foreach ($manifest['cartes'] as $c): ?>
      <li data-fichier="<?= htmlspecialchars($c['fichier']) ?>">
        <img src="../data/<?= htmlspecialchars($slug) ?>/cartes/<?= htmlspecialchars($c['fichier']) ?>" alt="">
        <input type="text" class="champ-mot" value="<?= htmlspecialchars($c['motAssocie'] ?? '') ?>" placeholder="Mot associé" maxlength="100">
        <div class="actions-carte">
          <button type="button" class="btn-monter" title="Monter">↑</button>
          <button type="button" class="btn-descendre" title="Descendre">↓</button>
          <button type="button" class="btn-suppr-carte" title="Supprimer">✕</button>
        </div>
      </li>
      <?php endforeach; ?>
    </ul>
    <p id="liste-vide" class="vide" <?= count($manifest['cartes']) ? 'hidden' : '' ?>>Aucune carte pour l'instant.</p>
  </section>
</main>
<script src="../assets/js/square-image.js?v=12"></script>
<script src="../assets/js/admin-ensemble.js?v=12"></script>
</body>
</html>
