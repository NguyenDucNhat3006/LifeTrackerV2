<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý lỗi CORS Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && !empty($data->user_id)) {
    
    // Tạm thời để category_id = NULL vì chưa có tính năng Danh mục
    // frequency set cứng là 'daily' (hằng ngày)
    $query = "INSERT INTO habits (user_id, category_id, title, frequency, weekly_goal_count) 
              VALUES (:user_id, NULL, :title, 'daily', :weekly_goal_count)";
              
    $stmt = $db->prepare($query);

    $title = htmlspecialchars(strip_tags($data->title));
    // Nếu Frontend không gửi goal lên thì mặc định là 7
    $weekly_goal_count = isset($data->weekly_goal) ? $data->weekly_goal : 7; 

    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':weekly_goal_count', $weekly_goal_count);

    try {
        if ($stmt->execute()) {
            http_response_code(201); // 201: Created
            echo json_encode(array("status" => "success", "message" => "Đã thêm thói quen mới!"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Lỗi CSDL: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Thiếu thông tin tên thói quen."));
}
?>