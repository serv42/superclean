<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$files = glob(__DIR__ . '/../../data/protocols/*.json');
$protocols = [];

foreach ($files as $file) {
    $protocols[] = json_decode(file_get_contents($file), true);
}

echo json_encode($protocols);