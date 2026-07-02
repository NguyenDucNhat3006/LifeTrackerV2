<?php
$host = '127.0.0.1';
$db_name = 'lifetracker_db';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. CREATE USERS TABLE
    $conn->exec("CREATE TABLE IF NOT EXISTS users (
        id INT  AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 2. CREATE CATEGORIES TABLE
    $conn->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        icon VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // 3. CREATE TASKS TABLE
    $conn->exec("CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        user_id INT NOT NULL,
        category_id INT NULL,
        parent_id INT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority INT DEFAULT 2,
        time_spent INT DEFAULT 0,
        start_at TIMESTAMP NULL,
        due_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE
    )");

    // 4. CREATE HABITS TABLE (Đã sửa category_id thành NULL)
    $conn->exec("CREATE TABLE IF NOT EXISTS habits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NULL,
        title VARCHAR(255) NOT NULL,
        frequency VARCHAR(255) NOT NULL,
        weekly_goal_count INT DEFAULT 7,
        streak INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )");

    // 5. CREATE LOGS TABLE
    $conn->exec("CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        habit_id INT NOT NULL,
        log_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'done',
        UNIQUE KEY habit_date_unique (habit_id, log_date),
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    )");

    // 6. CREATE JOURNALS TABLE
    $conn->exec("CREATE TABLE IF NOT EXISTS journals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    echo "Khởi tạo thành công 6 bảng cho LifeTracker!! đùng đùng đùng";
} catch ( PDOException $e ) {
    echo "Lỗi: " . $e->getMessage();
}
?>