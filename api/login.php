<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input) || empty($input['role']) || empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid login data.']);
    exit;
}

$role = trim($input['role']);
$email = trim($input['email']);
$password = trim($input['password']);

$stmt = $pdo->prepare('SELECT id, username, mobilenumber, password FROM users WHERE role = ? AND email = ? LIMIT 1');
$stmt->execute([$role, $email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Email not found for selected role.']);
    exit;
}

if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Password does not match.']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Login successful.',
    'user' => [
        'username' => $user['username'],
        'mobilenumber' => $user['mobilenumber'],
        'role' => $role
    ]
]);
