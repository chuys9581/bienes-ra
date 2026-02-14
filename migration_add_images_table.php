<?php
include_once 'api/config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    $sql = "CREATE TABLE IF NOT EXISTS propiedad_imagenes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        propiedad_id INT NOT NULL,
        url_imagen VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $db->exec($sql);
    echo "Tabla propiedad_imagenes creada exitosamente.";
} catch(PDOException $e) {
    echo "Error al crear la tabla: " . $e->getMessage();
}
?>
