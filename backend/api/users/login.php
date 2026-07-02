<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý pre-flight request của CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { 
    http_response_code(200); 
    exit(); 
}

include_once '../../config/database.php';
$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    // 1. Tìm user theo email
    $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute([':email' => $data->email]);
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // ==========================================
        // 2. KIỂM TRA TRẠNG THÁI KHÓA TÀI KHOẢN
        // ==========================================
        if (isset($row['status']) && $row['status'] === 'locked') {
            http_response_code(403); // Báo lỗi 403 Forbidden
            echo json_encode(["message" => "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên."]);
            exit(); // Chặn đứng luôn tại đây, không cho chạy tiếp
        }

        // 3. Kiểm tra mật khẩu (Hỗ trợ cả mật khẩu đã mã hóa và chưa mã hóa)
        $password_matched = false;
        if (password_verify($data->password, $row['password'])) {
            $password_matched = true;
        } else if ($data->password === $row['password']) {
            $password_matched = true; // Fallback nếu Database của bạn lưu dạng text thường
        }

        if ($password_matched) {
            // 4. Cập nhật thời gian hoạt động (last_active) để Admin Dashboard đếm DAU
            $updateQuery = "UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = :id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([':id' => $row['id']]);

            // Xóa password khỏi response trước khi gửi về React để bảo mật
            unset($row['password']);
            
            http_response_code(200);
            echo json_encode([
                "message" => "Đăng nhập thành công!",
                "user" => $row
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Sai mật khẩu, vui lòng thử lại!"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Tài khoản email này không tồn tại!"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Vui lòng nhập đầy đủ Email và Mật khẩu."]);
}
?>