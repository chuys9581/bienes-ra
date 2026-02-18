<?php
/**
 * Script para verificar agentes en la base de datos
 */
header('Content-Type: text/plain; charset=utf-8');

include_once 'api/config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    echo "=== VERIFICACIÓN DE AGENTES EN BASE DE DATOS ===\n\n";
    
    $query = "SELECT id, nombre, apellido, email, cargo, imagen, antiguedad, activo, created_at 
              FROM agentes 
              ORDER BY created_at DESC 
              LIMIT 10";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $agentes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($agentes) == 0) {
        echo "❌ No hay agentes en la base de datos\n";
    } else {
        echo "✅ Total de agentes encontrados: " . count($agentes) . "\n\n";
        
        foreach ($agentes as $agente) {
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            echo "🆔 ID: " . $agente['id'] . "\n";
            echo "👤 Nombre: " . $agente['nombre'] . " " . $agente['apellido'] . "\n";
            echo "📧 Email: " . $agente['email'] . "\n";
            echo "💼 Cargo: " . ($agente['cargo'] ?: 'N/A') . "\n";
            echo "⏰ Antigüedad: " . ($agente['antiguedad'] ?: 'N/A') . "\n";
            echo "✅ Activo: " . ($agente['activo'] ? 'Sí' : 'No') . "\n";
            
            if ($agente['imagen']) {
                if (strpos($agente['imagen'], 'cloudinary.com') !== false) {
                    echo "🖼️  Imagen (Cloudinary): ✅ URL guardada correctamente\n";
                    echo "   URL: " . $agente['imagen'] . "\n";
                } else {
                    echo "🖼️  Imagen: " . $agente['imagen'] . "\n";
                }
            } else {
                echo "🖼️  Imagen: ❌ Sin imagen\n";
            }
            
            echo "📅 Creado: " . $agente['created_at'] . "\n";
        }
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    }
    
} catch(PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n✅ Verificación completada.\n";
?>
