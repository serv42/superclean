<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key');

require_once __DIR__ . '/../../config/.env'; // oder dotenv laden

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['to']) || empty($input['subject']) || empty($input['body'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// TODO: PHPMailer Integration hier
echo json_encode([
    'success' => true,
    'message' => 'Email would be sent here (PHPMailer integration pending)',
    'data' => $input
]);