<?php
// Suprimir warnings deprecados para evitar que rompan las respuestas JSON
error_reporting(E_ALL & ~E_DEPRECATED);

require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener consultas
        getAllConsultas($pdo);
        break;
    
    case 'POST':
        // Crear nueva consulta
        createConsulta($pdo);
        break;
    
    default:
        sendResponse(['error' => 'Método no permitido'], 405);
}

function getAllConsultas($pdo) {
    $query = "SELECT c.*, p.titulo as propiedad_titulo 
              FROM consultas c 
              LEFT JOIN propiedades p ON c.propiedad_id = p.id 
              ORDER BY c.fecha_consulta DESC";
    
    try {
        $stmt = $pdo->query($query);
        $consultas = $stmt->fetchAll();
        sendResponse(['success' => true, 'data' => $consultas]);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}

function createConsulta($pdo) {
    $data = getPostData();
    
    $required = ['nombre', 'email', 'mensaje'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendResponse(['error' => "Campo requerido: $field"], 400);
        }
    }
    
    // Validar email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendResponse(['error' => 'Email inválido'], 400);
    }
    
    $query = "INSERT INTO consultas (propiedad_id, nombre, email, telefono, mensaje) 
              VALUES (:propiedad_id, :nombre, :email, :telefono, :mensaje)";
    
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            ':propiedad_id' => $data['propiedad_id'] ?? null,
            ':nombre' => $data['nombre'],
            ':email' => $data['email'],
            ':telefono' => $data['telefono'] ?? null,
            ':mensaje' => $data['mensaje']
        ]);
        
        $id = $pdo->lastInsertId();
        sendResponse(['success' => true, 'id' => $id, 'message' => 'Consulta enviada exitosamente'], 201);
    } catch (PDOException $e) {
        sendResponse(['error' => $e->getMessage()], 500);
    }
}
?>
