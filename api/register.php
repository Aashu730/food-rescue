<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request payload.']);
    exit;
}

$required = ['role', 'username', 'mnumber', 'email', 'password', 'region', 'address', 'city', 'state', 'zipcode'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing field: ' . $field]);
        exit;
    }
}

$role = trim($input['role']);
$username = trim($input['username']);
$mnumber = trim($input['mnumber']);
$email = trim($input['email']);
$password = trim($input['password']);
$region = trim($input['region']);
$address = trim($input['address']);
$city = trim($input['city']);
$state = trim($input['state']);
$zipcode = trim($input['zipcode']);
$mark = isset($input['mark']) ? trim($input['mark']) : 'default';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if (!preg_match('/^[0-9]{6}$/', $zipcode)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid zipcode.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR mobilenumber = ?');
$stmt->execute([$email, $mnumber]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email or mobile number already registered.']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO users (role, username, mobilenumber, email, password, region, address, city, state, zipcode, mark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$success = $stmt->execute([$role, $username, $mnumber, $email, $hash, $region, $address, $city, $state, $zipcode, $mark]);

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Registration completed successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to complete registration.']);
}
