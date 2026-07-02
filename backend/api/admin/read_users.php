<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../../config/database.php';

$db = (new Database())->getConnection();

try {
    // Lấy danh sách người dùng, sắp xếp mới nhất lên đầu
    $query = "SELECT id, username, email, IFNULL(status, 'active') as status, created_at, last_active FROM users ORDER BY created_at DESC";
    $stmt = $db->query($query);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($users);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi server: " . $e->getMessage()]);
}
?>