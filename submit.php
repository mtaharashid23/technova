<?php
// Stratrix Technology - Form Submission Handler (Native PHP mail())
// No PHPMailer, No Database - Simple & Lightweight

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Parse JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

// Sanitize helper
function clean($data) {
    if (is_array($data)) return array_map('clean', $data);
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

$data = array_map('clean', $input);

// Extract fields
$name     = $data['name'] ?? '';
$email    = $data['email'] ?? '';
$phone    = $data['phone'] ?? '';
$service  = $data['service'] ?? '';
$company  = $data['company'] ?? '';
$message  = $data['message'] ?? '';
$formType = $data['formType'] ?? 'unknown';

// Validation
if (empty($name) || strlen($name) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter your full name.']);
    exit;
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// ===== EMAIL CONFIGURATION =====
// ⚠️ CHANGE THESE FOR YOUR SETUP
$recipient = 'info@stratrixtechnology.com';        // ← Your receiving email
$subject   = "New $formType Inquiry from $name";
$replyTo   = $email;

// Build HTML email
$body = "
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'><style>
    body{font-family:'Poppins',Arial,sans-serif;background:#f8fafc;padding:20px;margin:0}
    .container{max-width:500px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1)}
    .header{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:25px;text-align:center;color:#fff}
    .header h2{margin:0;font-size:1.4rem}
    .content{padding:30px}
    .field{margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid #e2e8f0}
    .field:last-child{border-bottom:none;margin:0;padding:0}
    .label{font-weight:600;color:#64748b;font-size:0.85rem;margin-bottom:6px}
    .value{color:#1e293b;font-size:1rem;word-break:break-word;line-height:1.5}
    .footer{background:#f1f5f9;padding:20px;text-align:center;color:#64748b;font-size:0.8rem}
</style></head>
<body>
<div class='container'>
    <div class='header'><h2>🚀 New Contact Inquiry</h2></div>
    <div class='content'>
        <div class='field'><div class='label'>Form Type</div><div class='value'>" . ucfirst($formType) . "</div></div>
        <div class='field'><div class='label'>Name</div><div class='value'>$name</div></div>
        <div class='field'><div class='label'>Email</div><div class='value'><a href='mailto:$email' style='color:#6366f1;text-decoration:none'>$email</a></div></div>
        <div class='field'><div class='label'>Phone</div><div class='value'>" . ($phone ?: 'Not provided') . "</div></div>
        <div class='field'><div class='label'>Service</div><div class='value'>" . ($service ?: 'Not specified') . "</div></div>
        <div class='field'><div class='label'>Company</div><div class='value'>" . ($company ?: 'Not provided') . "</div></div>
        <div class='field'><div class='label'>Message</div><div class='value'>" . nl2br($message ?: 'No message provided') . "</div></div>
        <div class='field'><div class='label'>Submitted From</div><div class='value'>" . ($data['pageUrl'] ?? 'Unknown') . "</div></div>
    </div>
    <div class='footer'>
        Sent via Stratrix Technology Website • " . date('F j, Y, g:i a') . "<br>
        IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "
    </div>
</div>
</body>
</html>
";

// Headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Stratrix Technology Website <info@stratrixtechnology.com>\r\n";
$headers .= "Reply-To: $replyTo\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
$sent = @mail($recipient, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
} else {
    // Localhost fallback (mail() doesn't work without SMTP config)
    if (in_array($_SERVER['SERVER_ADDR'], ['127.0.0.1', '::1', 'localhost'], true)) {
        // Log to file for testing
        $log = "[" . date('Y-m-d H:i:s') . "] $formType: $name ($email) - $message\n";
        file_put_contents(__DIR__ . '/form-submissions.log', $log, FILE_APPEND | LOCK_EX);
        echo json_encode(['success' => true, 'message' => 'Test mode: Data logged to form-submissions.log']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to send email. Please try again.']);
    }
}
?>