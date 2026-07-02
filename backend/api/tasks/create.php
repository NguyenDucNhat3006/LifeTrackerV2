<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8   ");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ( $_SERVER['REQUEST_METHOD'] == 'OPTIONS' ) {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ( !empty($data->title) && !empty($data->user_id) ) {
    $query = "INSERT INTO tasks (user_id, title, status, start_at) VALUES (:user_id, :title, 'pending', :start_at)";
    $stmt = $db->prepare($query);

    $title = htmlspecialchars(strip_tags($data->title));
    $start_at = !empty($data->start_at) ? $data->start_at : date('Y-m-d H:i:s');

    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':start_at', $start_at);

    try {
        if( $stmt->execute()) {
            http_response_code(201);
            echo json_encode( array(
                "status" => "success",
                "message" => "Đã thêm công việc mới!"
            ));
        }

    } catch ( PDOException $event ) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Lỗi hệ thống: " . $event->getMessage()));
    }

    } else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Thiếu thông tin công việc hoặc user_id"));
}
?>