<?php
define('APP_INIT', true);
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

if (!isAuthenticated()) {
    jsonResponse(['error' => 'Non autorisé'], 401);
}

$action = $_POST['action'] ?? '';
$slug = $_POST['slug'] ?? '';

if (!isValidSlug($slug)) {
    jsonResponse(['error' => 'Ensemble invalide'], 400);
}

$manifest = readManifest($slug);
if ($manifest === null) {
    jsonResponse(['error' => 'Ensemble introuvable'], 404);
}

if ($action === 'delete') {
    $fichier = basename($_POST['fichier'] ?? '');
    $manifest['cartes'] = array_values(array_filter($manifest['cartes'], function ($c) use ($fichier) {
        return $c['fichier'] !== $fichier;
    }));
    @unlink(DATA_DIR . '/' . $slug . '/cartes/' . $fichier);
    writeManifest($slug, $manifest);
    jsonResponse(['success' => true]);
}

if ($action === 'update') {
    $fichier = basename($_POST['fichier'] ?? '');
    $motAssocie = trim($_POST['motAssocie'] ?? '');
    if (mb_strlen($motAssocie) > 100) {
        jsonResponse(['error' => 'Mot associé trop long'], 400);
    }
    $trouve = false;
    foreach ($manifest['cartes'] as &$c) {
        if ($c['fichier'] === $fichier) {
            $c['motAssocie'] = $motAssocie;
            $trouve = true;
        }
    }
    unset($c);
    if (!$trouve) {
        jsonResponse(['error' => 'Carte introuvable'], 404);
    }
    writeManifest($slug, $manifest);
    jsonResponse(['success' => true]);
}

if ($action === 'reorder') {
    $ordre = $_POST['ordre'] ?? [];
    if (!is_array($ordre)) {
        jsonResponse(['error' => 'Ordre invalide'], 400);
    }
    $parFichier = [];
    foreach ($manifest['cartes'] as $c) {
        $parFichier[$c['fichier']] = $c;
    }
    $nouvelles = [];
    foreach ($ordre as $f) {
        $f = basename($f);
        if (isset($parFichier[$f])) {
            $nouvelles[] = $parFichier[$f];
            unset($parFichier[$f]);
        }
    }
    foreach ($parFichier as $c) {
        $nouvelles[] = $c;
    }
    $manifest['cartes'] = $nouvelles;
    writeManifest($slug, $manifest);
    jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Action inconnue'], 400);
