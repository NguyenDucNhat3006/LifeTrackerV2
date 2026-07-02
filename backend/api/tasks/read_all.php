<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if ($user_id == null) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Thiếu user_id."]);
    exit();
}

try {
    // Lấy toàn bộ task để React tự xử lý vẽ biểu đồ và tính Sự kiện sắp tới
    $query = "SELECT * FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    $tasks_arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($tasks_arr, $row);
    }

    http_response_code(200);
    echo json_encode(["status" => "success", "data" => $tasks_arr]);
} catch (PDOException $event) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " .  $event->getMessage()]);
}
?>