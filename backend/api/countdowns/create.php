<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../../config/database.php';
$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->title) && !empty($data->target_date)) {
    $color = !empty($data->color) ? $data->color : '#2563eb';
    $query = "INSERT INTO countdowns (user_id, title, target_date, color) VALUES (:user_id, :title, :target_date, :color)";
    $stmt = $db->prepare($query);
    if($stmt->execute([':user_id' => $data->user_id, ':title' => $data->title, ':target_date' => $data->target_date, ':color' => $color])) {
        echo json_encode(["message" => "Đã tạo đếm ngược thành công!"]);
    }
} else {
    http_response_code(400); echo json_encode(["message" => "Thiếu thông tin!"]);
}
?>