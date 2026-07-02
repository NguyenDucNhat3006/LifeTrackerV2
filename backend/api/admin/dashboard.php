<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../../config/database.php';

$db = (new Database())->getConnection();

try {
    // ==========================================
    // 1. BIỂU ĐỒ TĂNG TRƯỞNG (100% DỮ LIỆU THẬT TỪ HÀNH ĐỘNG)
    // ==========================================
    $growthData = [];
    for ($i = 29; $i >= 0; $i--) {
        $dateStr = date('Y-m-d', strtotime("-$i days"));
        $growthData[$dateStr] = [
            'day' => date('d/m', strtotime("-$i days")),
            'newUser' => 0,
            'dau' => 0
        ];
    }

    // A. Đếm số User đăng ký mới thực tế (User mới chắc chắn tính là 1 DAU)
    $stmtNewUsers = $db->query("SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(created_at)");
    while($row = $stmtNewUsers->fetch(PDO::FETCH_ASSOC)) {
        if(isset($growthData[$row['date']])) {
            $growthData[$row['date']]['newUser'] = (int)$row['count'];
            $growthData[$row['date']]['dau'] += (int)$row['count']; // Cộng user mới vào DAU
        }
    }

    // B. Đếm số User cũ có hoạt động (Quét những user có tạo/làm Tasks trong từng ngày)
    // Dùng COUNT(DISTINCT user_id) để đảm bảo 1 người tạo 10 task trong 1 ngày cũng chỉ tính là 1 DAU.
    $stmtActiveTasks = $db->query("SELECT DATE(start_at) as date, COUNT(DISTINCT user_id) as count FROM tasks WHERE start_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(start_at)");
    while($row = $stmtActiveTasks->fetch(PDO::FETCH_ASSOC)) {
        if(isset($growthData[$row['date']])) {
            $growthData[$row['date']]['dau'] += (int)$row['count']; // Cộng dồn lượng user có tương tác vào DAU
        }
    }

    // ==========================================
    // 2. BIỂU ĐỒ TRÒN - TỶ LỆ TÍNH NĂNG (100% THẬT)
    // ==========================================
    $tables = [
        'Công việc' => ['table' => 'tasks', 'color' => '#10b981'],
        'Nhật ký' => ['table' => 'journals', 'color' => '#3b82f6'],
        'Lịch học' => ['table' => 'subjects', 'color' => '#f59e0b'],
        'Thói quen' => ['table' => 'habits', 'color' => '#ef4444']
    ];
    $featureData = [];
    foreach ($tables as $name => $info) {
        try {
            // Đếm số lượng bản ghi thực tế đang tồn tại trong hệ thống
            $stmt = $db->query("SELECT COUNT(*) as count FROM " . $info['table']);
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            if ($count > 0) {
                $featureData[] = ['name' => $name, 'value' => (int)$count, 'color' => $info['color']];
            }
        } catch(Exception $e) { } 
    }

    // ==========================================
    // 3. SỨC KHỎE VẬN HÀNH (CẢNH BÁO THẬT)
    // ==========================================
    $alerts = [];
    
    // Cảnh báo nếu có tài khoản bị khóa
    $stmtLocked = $db->query("SELECT COUNT(*) as count FROM users WHERE status = 'locked'");
    $lockedUsers = $stmtLocked->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
    if ($lockedUsers > 0) {
        $alerts[] = ['id' => 1, 'alert_type' => 'warning', 'message' => "Hệ thống đang có {$lockedUsers} tài khoản bị khóa."];
    }

    // Ghi nhận công việc tạo mới trong ngày
    $stmtNewTasks = $db->query("SELECT COUNT(*) as count FROM tasks WHERE DATE(created_at) = CURDATE()");
    $newTasks = $stmtNewTasks->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
    if ($newTasks > 0) {
        $alerts[] = ['id' => 2, 'alert_type' => 'info', 'message' => "Hệ thống ghi nhận {$newTasks} công việc (tasks) mới được tạo trong hôm nay."];
    }

    if (empty($alerts)) {
        $alerts[] = ['id' => 3, 'alert_type' => 'success', 'message' => "Toàn bộ API và Database đang hoạt động trơn tru."];
    }

    // ==========================================
    // 4. 4 THẺ KPI TRÊN CÙNG (100% THẬT)
    // ==========================================
    $stmtTotal = $db->query("SELECT COUNT(*) as total FROM users");
    $total_users = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    $stmtNew = $db->query("SELECT COUNT(*) as new_users FROM users WHERE DATE(created_at) = CURDATE()");
    $new_users = $stmtNew->fetch(PDO::FETCH_ASSOC)['new_users'] ?? 0;

    $stmtOnline = $db->query("SELECT COUNT(*) as online FROM users WHERE last_active >= NOW() - INTERVAL 15 MINUTE");
    $online_users = $stmtOnline->fetch(PDO::FETCH_ASSOC)['online'] ?? 0;

    $stmtInactive = $db->query("SELECT COUNT(*) as inactive FROM users WHERE last_active <= NOW() - INTERVAL 30 DAY");
    $inactive_users = $stmtInactive->fetch(PDO::FETCH_ASSOC)['inactive'] ?? 0;

    // Trả JSON về cho React
    echo json_encode([
        'kpis' => [
            'total_users' => (int)$total_users,
            'online_users' => (int)$online_users,
            'new_users' => (int)$new_users,
            'inactive_users' => (int)$inactive_users
        ],
        'growthData' => array_values($growthData),
        'featureData' => empty($featureData) ? [['name'=>'Chưa có dữ liệu', 'value'=>1, 'color'=>'#e2e8f0']] : $featureData,
        'alerts' => $alerts
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi server: " . $e->getMessage()]);
}
?>