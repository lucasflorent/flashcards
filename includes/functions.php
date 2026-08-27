<?php
if (!defined('APP_INIT')) { http_response_code(403); exit; }

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function slugify($text) {
    $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text);
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    $text = trim($text, '-');
    return $text !== '' ? $text : 'ensemble';
}

function uniqueSlug($base) {
    $slug = $base;
    $i = 2;
    while (is_dir(DATA_DIR . '/' . $slug)) {
        $slug = $base . '-' . $i;
        $i++;
    }
    return $slug;
}

function isValidSlug($slug) {
    return is_string($slug) && $slug !== '' && preg_match('/^[a-z0-9-]+$/', $slug);
}

function readIndex() {
    $path = DATA_DIR . '/index.json';
    if (!file_exists($path)) return [];
    $data = json_decode(file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function writeIndex($data) {
    file_put_contents(DATA_DIR . '/index.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function readManifest($slug) {
    $path = DATA_DIR . '/' . $slug . '/manifest.json';
    if (!file_exists($path)) return null;
    $data = json_decode(file_get_contents($path), true);
    return is_array($data) ? $data : null;
}

function writeManifest($slug, $data) {
    file_put_contents(DATA_DIR . '/' . $slug . '/manifest.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
