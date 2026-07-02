<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý pre-flight request của CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../../config/database.php';
$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->status)) {
    $query = "UPDATE users SET status = :status WHERE id = :id";
    $stmt = $db->prepare($query);

    if($stmt->execute([':status' => $data->status, ':id' => $data->id])) {
        echo json_encode(["message" => "Đã cập nhật trạng thái tài khoản!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Lỗi server không thể cập nhật."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu dữ liệu truyền lên."]);
}
?>