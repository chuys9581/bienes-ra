<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    // Check if column exists
    $query = "SHOW COLUMNS FROM propiedades LIKE 'mejor_venta'";
    $stmt = $db->prepare($query);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        // Add column
        $query = "ALTER TABLE propiedades ADD COLUMN mejor_venta TINYINT(1) DEFAULT 0 AFTER destacada";
        $db->exec($query);
        echo json_encode(['success' => true, 'message' => 'Columna mejor_venta agregada exitosamente.']);
    } else {
        echo json_encode(['success' => true, 'message' => 'La columna mejor_venta ya existe.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>
