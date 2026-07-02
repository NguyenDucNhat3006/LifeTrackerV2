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
    // Lấy toàn bộ thói quen và tất cả lịch sử check-in của user
    $query = "SELECT h.id, h.title, h.weekly_goal_count, h.created_at, l.log_date
              FROM habits h
              LEFT JOIN logs l ON h.id = l.habit_id
              WHERE h.user_id = :user_id
              ORDER BY h.created_at ASC, l.log_date DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    $habits_map = [];

    // Gom nhóm dữ liệu theo từng thói quen
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $h_id = $row['id'];
        if (!isset($habits_map[$h_id])) {
            $habits_map[$h_id] = [
                "id" => (int)$h_id,
                "title" => $row['title'],
                "weekly_goal" => (int)$row['weekly_goal_count'],
                "completed_dates" => [],
                "total_days" => 0,
                "streak" => 0
            ];
        }
        if ($row['log_date']) {
            $habits_map[$h_id]['completed_dates'][] = $row['log_date'];
        }
    }

    // THUẬT TOÁN TÍNH CHUỖI (STREAK) & TỔNG NGÀY
    $today_str = date('Y-m-d');
    $yesterday_str = date('Y-m-d', strtotime('-1 day'));

    foreach ($habits_map as &$habit) {
        $dates = $habit['completed_dates'];
        $habit['total_days'] = count($dates); // ⚡ Tổng số ngày

        $streak = 0;
        $current_check_date = null;

        //  Tìm xem hôm nay hoặc hôm qua có check-in không để tính streak
        if (in_array($today_str, $dates)) {
            $current_check_date = strtotime($today_str);
        } elseif (in_array($yesterday_str, $dates)) {
            $current_check_date = strtotime($yesterday_str);
        }

        // Đếm lùi về quá khứ xem liên tiếp được bao nhiêu ngày
        if ($current_check_date !== null) {
            while (in_array(date('Y-m-d', $current_check_date), $dates)) {
                $streak++;
                $current_check_date = strtotime('-1 day', $current_check_date);
            }
        }
        $habit['streak'] = $streak;
    }

    http_response_code(200);
    // Trả về mảng JSON sạch đẹp
    echo json_encode(array_values($habits_map));

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("error" => "Lỗi truy vấn SQL: " . $e->getMessage()));
}
?>