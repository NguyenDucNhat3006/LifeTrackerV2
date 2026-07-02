<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ( $_SERVER['REQUEST_METHOD'] == 'OPTIONS' ) {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ( !empty($data->id) && !empty($data->user_id) && !empty($data->status)) {
    $query = "UPDATE tasks
    SET status = :status
    WHERE id = :id AND user_id = :user_id";

    $stmt = $db->prepare($query);
    
    $status = htmlspecialchars(strip_tags($data->status));
    $id = htmlspecialchars(strip_tags($data->id));
    $user_id = htmlspecialchars(strip_tags($data->user_id));

    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':user_id', $user_id);

    try {
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array("status" => "success", "message" => "Đã cập nhật trạng thái thành công."));
        } else {
            http_response_code(200); 
            echo json_encode(array("status" => "info", "message" => "Không có thay đổi nào."));
        }

    } catch ( PDOException $event ) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Lỗi hệ thống: " . $event->getMessage()));
    }

} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Thiếu thông tin cần thiết."));
}

?>