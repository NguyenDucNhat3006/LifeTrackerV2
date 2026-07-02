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

if(!empty($data->habit_id) && !empty($data->date)) {
    
    $check_query = "SELECT id FROM habits WHERE id = :habit_id AND user_id = :user_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':habit_id', $data->habit_id);
    $check_stmt->bindParam(':user_id', $data->user_id);
    $check_stmt->execute();

    if($check_stmt->rowCount() === 0) {
        http_response_code(403); 
        echo json_encode(array("message" => "Không có quyền thao tác trên thói quen này."));
        exit();
    }

    // Đã đổi habit_logs thành logs, date thành log_date
    $query_check_log = "SELECT id FROM logs WHERE habit_id = :habit_id AND log_date = :date";
    $stmt_check_log = $db->prepare($query_check_log);
    $stmt_check_log->bindParam(':habit_id', $data->habit_id);
    $stmt_check_log->bindParam(':date', $data->date);
    $stmt_check_log->execute();

    if ($stmt_check_log->rowCount() > 0) {
        $query_delete = "DELETE FROM logs WHERE habit_id = :habit_id AND log_date = :date";
        $stmt_delete = $db->prepare($query_delete);
        $stmt_delete->bindParam(':habit_id', $data->habit_id);
        $stmt_delete->bindParam(':date', $data->date);
        $stmt_delete->execute();
        
        echo json_encode(array("status" => "unlogged", "message" => "Đã hủy tích."));
    } else {
        $query_insert = "INSERT INTO logs (habit_id, log_date) VALUES (:habit_id, :date)";
        $stmt_insert = $db->prepare($query_insert);
        $stmt_insert->bindParam(':habit_id', $data->habit_id);
        $stmt_insert->bindParam(':date', $data->date);
        $stmt_insert->execute();
        
        echo json_encode(array("status" => "logged", "message" => "Đã tích hoàn thành."));
    }
    http_response_code(200);

} else {
    http_response_code(400);
}
?>