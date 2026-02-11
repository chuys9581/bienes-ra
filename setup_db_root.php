<?php
header('Content-Type: application/json');
// Adjust paths assuming this file is in project root
require_once 'api/config.php';
require_once 'api/config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();

    echo "Conectado a la base de datos...\n";

    // Check if column exists
    $query = "SHOW COLUMNS FROM propiedades LIKE 'mejor_venta'";
    $stmt = $db->prepare($query);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        // Add column
        echo "Agregando columna mejor_venta...\n";
        $query = "ALTER TABLE propiedades ADD COLUMN mejor_venta TINYINT(1) DEFAULT 0 AFTER destacada";
        $db->exec($query);
        echo "EXITO: Columna mejor_venta agregada exitosamente.\n";
    } else {
        echo "INFO: La columna mejor_venta ya existe.\n";
    }

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
