<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    $sql = "CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agente_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agente_id) REFERENCES agentes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql);
    echo json_encode(['success' => true, 'message' => 'Table reviews created successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error creating table: ' . $e->getMessage()]);
}
?>
