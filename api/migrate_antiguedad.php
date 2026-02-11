<?php
/**
 * Migration: Renombrar columna biografia -> antiguedad en tabla agentes
 */

include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    // Check if column 'biografia' exists
    $checkQuery = "SHOW COLUMNS FROM agentes LIKE 'biografia'";
    $stmt = $db->query($checkQuery);
    
    if ($stmt->rowCount() > 0) {
        $query = "ALTER TABLE agentes CHANGE COLUMN biografia antiguedad VARCHAR(100) DEFAULT NULL";
        $db->exec($query);
        echo json_encode(['success' => true, 'message' => 'Columna biografia renombrada a antiguedad']);
    } else {
        // Check if antiguedad already exists
        $checkNew = "SHOW COLUMNS FROM agentes LIKE 'antiguedad'";
        $stmtNew = $db->query($checkNew);
        
        if ($stmtNew->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Columna antiguedad ya existe']);
        } else {
            $query = "ALTER TABLE agentes ADD COLUMN antiguedad VARCHAR(100) DEFAULT NULL";
            $db->exec($query);
            echo json_encode(['success' => true, 'message' => 'Columna antiguedad creada']);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
