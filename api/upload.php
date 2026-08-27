<?php
define('APP_INIT', true);
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

if (!isAuthenticated()) {
    jsonResponse(['error' => 'Non autorisé'], 401);
}

$slug = $_POST['slug'] ?? '';
$motAssocie = trim($_POST['motAssocie'] ?? '');

if (!isValidSlug($slug) || !is_dir(DATA_DIR . '/' . $slug)) {
    jsonResponse(['error' => 'Ensemble invalide'], 400);
}

if (mb_strlen($motAssocie) > 100) {
    jsonResponse(['error' => 'Mot associé trop long'], 400);
}

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['error' => 'Fichier manquant ou erreur lors de l\'envoi'], 400);
}

$file = $_FILES['image'];
$maxSize = 8 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    jsonResponse(['error' => 'Fichier trop volumineux (8 Mo max)'], 400);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);
if ($mime !== 'image/jpeg') {
    jsonResponse(['error' => 'Le fichier doit être une image JPEG'], 400);
}

$imgInfo = @getimagesize($file['tmp_name']);
if ($imgInfo === false || $imgInfo[2] !== IMAGETYPE_JPEG) {
    jsonResponse(['error' => 'Image JPEG invalide'], 400);
}

$filename = 'carte_' . bin2hex(random_bytes(8)) . '.jpg';
$dest = DATA_DIR . '/' . $slug . '/cartes/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    jsonResponse(['error' => 'Échec de l\'enregistrement du fichier'], 500);
}

$manifest = readManifest($slug);
if ($manifest === null) {
    jsonResponse(['error' => 'Ensemble introuvable'], 404);
}
$manifest['cartes'][] = ['fichier' => $filename, 'motAssocie' => $motAssocie];
writeManifest($slug, $manifest);

jsonResponse(['success' => true, 'fichier' => $filename]);
