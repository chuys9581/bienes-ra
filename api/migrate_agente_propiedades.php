<?php
/**
 * Migration: Crear tabla agente_propiedades
 * Ejecutar una sola vez para crear la tabla de relación
 */

include_once 'config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    $query = "CREATE TABLE IF NOT EXISTS agente_propiedades (
        agente_id INT NOT NULL,
        propiedad_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (agente_id, propiedad_id),
        FOREIGN KEY (agente_id) REFERENCES agentes(id) ON DELETE CASCADE,
        FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
    )";
    
    $db->exec($query);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Tabla agente_propiedades creada exitosamente'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}
