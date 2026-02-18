<?php
/**
 * Migration: Add moneda field to propiedades table
 * Run this once to add the moneda column
 */

require_once 'api/config/Database.php';

try {
    $database = new Database();
    $conn = $database->connect();
    
    echo "🔄 Iniciando migración: Agregar campo moneda...\n";
    
    // Check if column already exists
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'inmobiliaria_db' 
        AND TABLE_NAME = 'propiedades' 
        AND COLUMN_NAME = 'moneda'
    ");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        echo "⚠️  El campo 'moneda' ya existe en la tabla propiedades.\n";
        exit(0);
    }
    
    // Add moneda column
    $sql = "ALTER TABLE propiedades 
            ADD COLUMN moneda VARCHAR(3) DEFAULT 'MXN' AFTER precio";
    
    $conn->exec($sql);
    echo "✅ Campo 'moneda' agregado exitosamente.\n";
    
    // Update existing properties to have MXN as default
    $updateSql = "UPDATE propiedades SET moneda = 'MXN' WHERE moneda IS NULL";
    $conn->exec($updateSql);
    echo "✅ Propiedades existentes actualizadas con moneda MXN.\n";
    
    echo "✅ Migración completada exitosamente.\n";
    
} catch (PDOException $e) {
    echo "❌ Error en la migración: " . $e->getMessage() . "\n";
    exit(1);
}
?>
