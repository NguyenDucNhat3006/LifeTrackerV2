<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../../config/database.php';

$db = (new Database())->getConnection();
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

$stmt = $db->prepare("SELECT * FROM journals WHERE user_id = :user_id ORDER BY created_at DESC");
$stmt->execute([':user_id' => $user_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>