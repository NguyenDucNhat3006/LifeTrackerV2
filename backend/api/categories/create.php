<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->user_id)) {
    $query = "INSERT INTO categories (user_id, name, type, color) 
              VALUES (:user_id, :name, 'task', :color)";
    
    $stmt = $db->prepare($query);

    $name = htmlspecialchars(strip_tags($data->name));
    $color = !empty($data->color) ? htmlspecialchars(strip_tags($data->color)) : 'bg-gray-400 text-white';

    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':color', $color);

    try {
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("status" => "success", "message" => "Đã tạo nhãn thành công."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Lỗi CSDL: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Thiếu tên nhãn."));
}
?>