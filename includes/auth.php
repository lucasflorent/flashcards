<?php
if (!defined('APP_INIT')) { http_response_code(403); exit; }
require_once __DIR__ . '/config.php';

session_name(SESSION_NAME);
session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function isAuthenticated() {
    return !empty($_SESSION['admin_logged_in']);
}

function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: login.php');
        exit;
    }
}

function attemptLogin($password) {
    if (password_verify($password, ADMIN_PASSWORD_HASH)) {
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        return true;
    }
    return false;
}

function logout() {
    $_SESSION = [];
    session_destroy();
}
