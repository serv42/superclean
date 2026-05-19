<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['to']) || empty($input['subject'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields (to, subject)']);
    exit;
}

$to      = $input['to'];
$subject = $input['subject'];
$body    = $input['body'] ?? '';
$from    = $input['from'] ?? 'noreply@deine-domain.de';

// ==================== SMTP MODE (PHPMailer) ====================
if (!empty($input['smtp_host']) && !empty($input['smtp_user']) && !empty($input['smtp_pass'])) {
    
    // Try to load PHPMailer
    $phpmailerPath = __DIR__ . '/PHPMailer/src/';
    if (file_exists($phpmailerPath . 'PHPMailer.php')) {
        require $phpmailerPath . 'PHPMailer.php';
        require $phpmailerPath . 'SMTP.php';
        require $phpmailerPath . 'Exception.php';

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $input['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $input['smtp_user'];
            $mail->Password   = $input['smtp_pass'];
            $mail->SMTPSecure = $input['smtp_encryption'] ?? 'tls';
            $mail->Port       = $input['smtp_port'] ?? 587;

            $mail->setFrom($from, 'SuperClean');
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->CharSet = 'UTF-8';

            $mail->send();
            echo json_encode(['success' => true, 'message' => 'Email sent via SMTP']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'SMTP Error: ' . $mail->ErrorInfo]);
        }
        exit;
    } else {
        // PHPMailer not found - fallback to mail()
        echo json_encode(['warning' => 'PHPMailer not installed, falling back to mail()']);
    }
}

// ==================== FALLBACK: native mail() ====================
$headers  = "From: SuperClean <{$from}>\r\n";
$headers .= "Reply-To: {$from}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Email sent via mail()']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?>