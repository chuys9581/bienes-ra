<?php
/**
 * Script para asignar agentes a propiedades existentes
 */

include_once 'api/config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    // Obtener todos los agentes
    $agenteStmt = $db->query("SELECT id FROM agentes WHERE activo = 1");
    $agentes = $agenteStmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($agentes)) {
        echo "No hay agentes activos en la base de datos.\n";
        exit;
    }
    
    // Obtener todas las propiedades sin agente asignado
    $propiedadesStmt = $db->query("
        SELECT p.id 
        FROM propiedades p 
        LEFT JOIN agente_propiedades ap ON p.id = ap.propiedad_id 
        WHERE ap.agente_id IS NULL
    ");
    $propiedades = $propiedadesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($propiedades)) {
        echo "Todas las propiedades ya tienen agentes asignados.\n";
        exit;
    }
    
    echo "Asignando agentes a " . count($propiedades) . " propiedades...\n";
    
    $stmt = $db->prepare("INSERT INTO agente_propiedades (agente_id, propiedad_id) VALUES (:agente_id, :propiedad_id)");
    
    $assigned = 0;
    foreach ($propiedades as $propiedadId) {
        // Asignar un agente aleatorio de la lista
        $agenteId = $agentes[array_rand($agentes)];
        
        $stmt->bindValue(':agente_id', $agenteId);
        $stmt->bindValue(':propiedad_id', $propiedadId);
        
        if ($stmt->execute()) {
            $assigned++;
            echo "✓ Propiedad $propiedadId asignada al agente $agenteId\n";
        }
    }
    
    echo "\n✅ Se asignaron $assigned propiedades a agentes.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
