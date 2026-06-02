<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$type = isset($_GET['type']) ? $_GET['type'] : '';
$value = isset($_GET['value']) ? trim($_GET['value']) : '';
$role = isset($_GET['role']) ? trim($_GET['role']) : '';

if ($type === '' || $value === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing validation parameters.']);
    exit;
}

switch ($type) {
    case 'email':
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$value]);
        break;
    case 'mobile':
        $stmt = $pdo->prepare('SELECT id FROM users WHERE mobilenumber = ?');
        $stmt->execute([$value]);
        break;
    case 'username':
        if ($role === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Role is required for username validation.']);
            exit;
        }
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND role = ?');
        $stmt->execute([$value, $role]);
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid validation type.']);
        exit;
}

$exists = $stmt->fetch() ? true : false;

echo json_encode(['success' => true, 'exists' => $exists]);
