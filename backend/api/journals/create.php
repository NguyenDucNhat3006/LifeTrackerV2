<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../../config/database.php';
$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && isset($data->title)) {
    $content = isset($data->content) ? $data->content : '';
    $query = "INSERT INTO journals (user_id, title, content) VALUES (:user_id, :title, :content)";
    $stmt = $db->prepare($query);
    if($stmt->execute([':user_id' => $data->user_id, ':title' => $data->title, ':content' => $content])) {
        echo json_encode(["message" => "Đã tạo nhật ký!", "id" => $db->lastInsertId()]);
    }
}
?>