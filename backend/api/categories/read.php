<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}   

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu user_id."));
    exit();
}

try {
    $query = "SELECT id, name, color FROM categories WHERE user_id = :user_id AND type = 'task' ORDER BY id DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    $categories = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($categories, array(
            "id" => (int)$row['id'],
            "name" => $row['name'],
            "color" => $row['color']
        ));
    }

    http_response_code(200);
    echo json_encode($categories);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("error" => "Lỗi CSDL: " . $e->getMessage()));
}
?>