<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->user_id)) {
    // Tạo mảng lưu các trường cần cập nhật
    $fields = [];
    if (isset($data->category_id)) $fields[] = "category_id = :category_id";
    if (isset($data->priority)) $fields[] = "priority = :priority";
    if (isset($data->title)) $fields[] = "title = :title";

    if (count($fields) > 0) {
        $query = "UPDATE tasks SET " . implode(", ", $fields) . " WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);

        if (isset($data->category_id)) $stmt->bindParam(':category_id', $data->category_id);
        if (isset($data->priority)) $stmt->bindParam(':priority', $data->priority);
        if (isset($data->title)) $stmt->bindParam(':title', $data->title);
        
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':user_id', $data->user_id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Cập nhật thành công."));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Lỗi hệ thống."));
        }
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu dữ liệu."));
}
?>