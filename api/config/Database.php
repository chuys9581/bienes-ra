<?php
class Database {
    private $host = '127.0.0.1';
    private $db_name = 'inmobiliaria_db';
    private $username = 'inmobiliaria_user';
    private $password = 'inmobiliaria_pass';
    private $port = '3307';
    private $conn;

    public function connect() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo json_encode(['error' => 'Connection Error: ' . $e->getMessage()]);
            exit();
        }

        return $this->conn;
    }
}
?>
