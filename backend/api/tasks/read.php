<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8   ");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
$date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');

if ( $user_id == null ) {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Thiếu user_id."));
    exit();
}

try {
    $query = "SELECT id, title, status, time_spent
    FROM tasks
    WHERE user_id = :user_id
    AND DATE(start_at) = :date
    AND parent_id IS NULL
    ORDER BY created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':date', $date);
    $stmt->execute();

    $tasks_arr = array();

    if ( $stmt->rowCount() > 0 ) {
        while ( $row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($tasks_arr, array(
                "id" => $row['id'],
                'title' => $row['title'],
                "status" => $row['status'],
                "time_spent" => $row['time_spent']
            ));
        }

        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "data" => $tasks_arr
        ));

    } else {
        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "data" => array(),
            "message" => "Hiện chưa có công việc nào!"
        ));
    }

} catch ( PDOException $event ) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Lỗi CSDL: " .  $event->getMessage()));
}

?>