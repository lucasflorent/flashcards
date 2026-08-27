<?php
define('APP_INIT', true);
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

if (!isAuthenticated()) {
    jsonResponse(['error' => 'Non autorisé'], 401);
}

$action = $_POST['action'] ?? '';

if ($action === 'create') {
    $nom = trim($_POST['nom'] ?? '');
    if ($nom === '') {
        jsonResponse(['error' => 'Le nom de l\'ensemble est requis'], 400);
    }
    if (mb_strlen($nom) > 100) {
        jsonResponse(['error' => 'Nom trop long (100 caractères max)'], 400);
    }

    $slug = uniqueSlug(slugify($nom));
    $dir = DATA_DIR . '/' . $slug;

    if (!mkdir($dir . '/cartes', 0775, true)) {
        jsonResponse(['error' => 'Impossible de créer l\'ensemble'], 500);
    }

    writeManifest($slug, ['nom' => $nom, 'cartes' => []]);

    $index = readIndex();
    $index[] = ['slug' => $slug, 'nom' => $nom];
    writeIndex($index);

    jsonResponse(['success' => true, 'slug' => $slug]);
}

if ($action === 'delete') {
    $slug = $_POST['slug'] ?? '';
    if (!isValidSlug($slug)) {
        jsonResponse(['error' => 'Ensemble invalide'], 400);
    }

    $dir = DATA_DIR . '/' . $slug;
    if (is_dir($dir)) {
        $fichiers = glob($dir . '/cartes/*') ?: [];
        foreach ($fichiers as $f) {
            @unlink($f);
        }
        @rmdir($dir . '/cartes');
        @unlink($dir . '/manifest.json');
        @rmdir($dir);
    }

    $index = array_values(array_filter(readIndex(), function ($e) use ($slug) {
        return $e['slug'] !== $slug;
    }));
    writeIndex($index);

    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Action inconnue'], 400);
