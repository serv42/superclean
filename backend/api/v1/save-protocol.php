<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// TODO: In Datenbank speichern oder als Datei
$filename = __DIR__ . '/../../data/protocols/' . time() . '.json';
@mkdir(dirname($filename), 0777, true);
file_put_contents($filename, json_encode($input, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'message' => 'Protocol saved',
    'id' => time()
]);