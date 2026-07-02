<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', '0');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

$user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;

if (!$user_id || !isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu dữ liệu!"]);
    exit();
}

$fileContent = mb_convert_encoding(file_get_contents($_FILES['file']['tmp_name']), 'UTF-8', 'auto');
$lines = explode("\n", $fileContent);
$events = [];
$event = ['interval_weeks' => 1]; // Mặc định là học hàng tuần (1)

foreach ($lines as $line) {
    $line = trim($line);
    if ($line === 'BEGIN:VEVENT') { $event = ['interval_weeks' => 1]; } 
    elseif ($line === 'END:VEVENT') { if (!empty($event)) $events[] = $event; } 
    elseif (strpos($line, 'SUMMARY') === 0) {
        $parts = explode(':', $line, 2);
        $event['title'] = trim($parts[1]); 
    }
    elseif (strpos($line, 'DESCRIPTION') === 0) {
        $parts = explode(':', $line, 2);
        $event['description'] = trim($parts[1]); 
    }
    elseif (strpos($line, 'RRULE:') === 0) {
        if (preg_match('/UNTIL=(\d{4})(\d{2})(\d{2})/', $line, $m)) {
            $event['end_date'] = "{$m[1]}-{$m[2]}-{$m[3]}";
        }
        // ĐỌC LUẬT CÁCH TUẦN (INTERVAL)
        if (preg_match('/INTERVAL=(\d+)/', $line, $m_int)) {
            $event['interval_weeks'] = intval($m_int[1]);
        }
    }
    elseif (strpos($line, 'DTSTART') === 0 || strpos($line, 'DTEND') === 0) {
        $isStart = strpos($line, 'DTSTART') === 0;
        $timeStr = end(explode(':', $line));
        $digits = preg_replace('/[^0-9]/', '', $timeStr);
        if (strlen($digits) >= 8) {
            $date = substr($digits, 0, 4) . '-' . substr($digits, 4, 2) . '-' . substr($digits, 6, 2);
            $time = (strlen($digits) >= 14) ? substr($digits, 8, 2) . ':' . substr($digits, 10, 2) . ':00' : '00:00:00';
            
            if ($isStart) {
                $event['start_date'] = $date;
                $event['start_time'] = $time;
                $event['day_of_week'] = date('w', strtotime($date)); 
            } else {
                $event['end_time'] = $time;
            }
        }
    }
}

$colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
$colorIdx = 0;
$successCount = 0;

try {
    $db->prepare("DELETE FROM subjects WHERE user_id = :user_id")->execute([':user_id' => $user_id]);

    $query = "INSERT INTO subjects (user_id, title, description, day_of_week, start_time, end_time, start_date, end_date, color, interval_weeks) 
              VALUES (:user_id, :title, :description, :day_of_week, :start_time, :end_time, :start_date, :end_date, :color, :interval_weeks)";
    $stmt = $db->prepare($query);

    foreach ($events as $e) {
        if (isset($e['title']) && isset($e['start_time'])) {
            $end_date = isset($e['end_date']) ? $e['end_date'] : date('Y-m-d', strtotime($e['start_date'] . ' + 15 weeks'));
            $end_time = isset($e['end_time']) ? $e['end_time'] : date('H:i:s', strtotime($e['start_time'] . ' + 2 hours'));
            $color = $colors[$colorIdx % count($colors)];
            $colorIdx++;

            $stmt->execute([
                ':user_id' => $user_id, ':title' => $e['title'], ':description' => $e['description'] ?? '',
                ':day_of_week' => $e['day_of_week'], ':start_time' => $e['start_time'], ':end_time' => $end_time,
                ':start_date' => $e['start_date'], ':end_date' => $end_date, ':color' => $color,
                ':interval_weeks' => $e['interval_weeks']
            ]);
            $successCount++;
        }
    }
    echo json_encode(["message" => "Đã tạo thành công $successCount môn học vào Database!"]);
} catch (PDOException $e) {
    http_response_code(500); echo json_encode(["message" => "Lỗi: " . $e->getMessage()]);
}
?>