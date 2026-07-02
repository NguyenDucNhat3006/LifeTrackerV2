<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

include_once '../../config/database.php';
$db = (new Database())->getConnection();

// Lấy dữ liệu từ $_POST (vì Frontend sẽ gửi dạng FormData)
$user_id = $_POST['user_id'] ?? null;
$username = $_POST['username'] ?? null;
$email = $_POST['email'] ?? null;
$password = $_POST['password'] ?? null;
$current_avatar = $_POST['current_avatar'] ?? null;

if (!$user_id || !$username || !$email) {
    http_response_code(400);
    echo json_encode(["message" => "Vui lòng nhập đủ thông tin bắt buộc."]);
    exit();
}

// 1. XỬ LÝ UPLOAD ẢNH (Nếu có)
$avatarPath = $current_avatar;
if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = '../../uploads/avatars/';
    // Tạo tên file ngẫu nhiên để không bị trùng
    $fileName = time() . '_' . basename($_FILES['avatar']['name']);
    $targetFilePath = $uploadDir . $fileName;
    
    // Di chuyển file từ bộ nhớ tạm vào thư mục
    if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetFilePath)) {
        // Lưu đường dẫn tuyệt đối để Frontend dễ đọc
        $avatarPath = 'http://127.0.0.1:8080/is207_project/backend/uploads/avatars/' . $fileName;
    }
}

// 2. CẬP NHẬT DATABASE
try {
    $query = "UPDATE users SET username = :username, email = :email, avatar = :avatar";
    $params = [
        ':username' => $username, 
        ':email' => $email, 
        ':avatar' => $avatarPath, 
        ':id' => $user_id
    ];

    // Nếu người dùng có nhập mật khẩu mới thì mới cập nhật mật khẩu
    if (!empty($password)) {
        $query .= ", password = :password";
        // Nếu hệ thống cũ của bạn không mã hóa thì để $password, còn nếu có dùng password_hash thì bọc lại nhé.
        // Ở đây mình bọc mã hóa để bảo mật chuẩn chỉnh.
        $params[':password'] = password_hash($password, PASSWORD_DEFAULT);
    }
    $query .= " WHERE id = :id";

    $stmt = $db->prepare($query);
    if ($stmt->execute($params)) {
        // Lấy lại thông tin user mới nhất để trả về cho React cập nhật localStorage
        $stmtGet = $db->prepare("SELECT id, username, email, role, avatar FROM users WHERE id = :id");
        $stmtGet->execute([':id' => $user_id]);
        $updatedUser = $stmtGet->fetch(PDO::FETCH_ASSOC);

        echo json_encode(["message" => "Cập nhật hồ sơ thành công!", "user" => $updatedUser]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Lỗi server khi cập nhật."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi: " . $e->getMessage()]);
}
?>