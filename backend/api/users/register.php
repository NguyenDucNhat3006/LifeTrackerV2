<?php

// Cau hinh CORS cho phep React frontend truy cap API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ket noi database
include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Doc du lieu tu JSON do React gui
$data = json_decode(file_get_contents("php://input"));

//Kiem tra du lieu hop le hay khong
if ( !empty($data->username) && !empty($data->email) && !empty($data->password) ) {
    //mã hóa mật khẩu( tránh mấy thằng admin đọc được pass )
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    $query = "INSERT INTO users (username, email, password) VALUES (:username, :email, :password)";
    $stmt = $db->prepare($query);

    //lam sach data
    $username = htmlspecialchars(strip_tags($data->username));
    $email = htmlspecialchars(strip_tags($data->email));

    //gan data vao cau lenh sql
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password_hash);

    try {
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("status" => "success", "message" => "Đăng ký thành công!" ));
        }
    } catch (PDOException $event ) {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Lỗi: Email hoặc Username đã tồn tại."));
    }   
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Vui lòng điền đầy đủ thông tin."));
}

?>