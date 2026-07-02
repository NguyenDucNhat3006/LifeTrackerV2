<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../../config/database.php';
$db = (new Database())->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->title) && !empty($data->date) && !empty($data->start_time) && !empty($data->end_time)) {
    // Tự động tính "Thứ" dựa vào ngày được chọn
    $day_of_week = date('w', strtotime($data->date));
    $color = !empty($data->color) ? $data->color : '#3b82f6';

    $query = "INSERT INTO subjects (user_id, title, description, day_of_week, start_time, end_time, start_date, end_date, color, interval_weeks) 
              VALUES (:user_id, :title, '', :day_of_week, :start_time, :end_time, :start_date, :end_date, :color, 1)";
    $stmt = $db->prepare($query);

    if($stmt->execute([
        ':user_id' => $data->user_id,
        ':title' => $data->title,
        ':day_of_week' => $day_of_week,
        ':start_time' => $data->start_time,
        ':end_time' => $data->end_time,
        ':start_date' => $data->date,
        ':end_date' => $data->date, // Sự kiện 1 ngày thì start_date = end_date
        ':color' => $color
    ])) {
        echo json_encode(["message" => "Đã thêm sự kiện thành công!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Lỗi không thể lưu sự kiện."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Vui lòng điền đầy đủ thông tin!"]);
}
?>