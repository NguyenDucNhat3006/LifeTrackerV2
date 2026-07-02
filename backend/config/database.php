<?php
class Database
{
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;

    public $conn;

    public function __construct()
    {
        $this->host = getenv("DB_HOST") ?: "host.docker.internal";
        $this->db_name = getenv("DB_NAME") ?: "lifetracker_db";
        $this->username = getenv("DB_USER") ?: "root";
        $this->password = getenv("DB_PASSWORD") ?: "";
        $this->port = getenv("DB_PORT") ?: "3306";
    }

    public function getConnection()
    {
        $this->conn = null;

        try {

            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";

            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );

        } catch (PDOException $exception) {

            die("Database connection failed: " . $exception->getMessage());

        }

        return $this->conn;
    }
}

?>