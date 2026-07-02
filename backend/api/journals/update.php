<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../../config/database.php';
$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->user_id)) {
    $query = "UPDATE journals SET title = :title, content = :content WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->execute([':title' => $data->title, ':content' => $data->content, ':id' => $data->id, ':user_id' => $data->user_id]);
    echo json_encode(["message" => "Đã lưu!"]);
}
?>