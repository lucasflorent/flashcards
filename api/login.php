<?php
define('APP_INIT', true);
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

$password = $_POST['password'] ?? '';
if (attemptLogin($password)) {
    jsonResponse(['success' => true]);
}
jsonResponse(['error' => 'Mot de passe incorrect'], 401);
