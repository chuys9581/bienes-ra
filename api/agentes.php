<?php
// Suprimir warnings deprecados para evitar que rompan las respuestas JSON
error_reporting(E_ALL & ~E_DEPRECATED);

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once 'config/Database.php';
include_once 'models/Agente.php';

$database = new Database();
$db = $database->connect();

$agente = new Agente($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false];
$action = $_GET['action'] ?? null;

try {
    // --- Special actions for property assignment ---
    if ($action === 'get_properties' && $method === 'GET') {
        $agenteId = $_GET['agente_id'] ?? null;
        if (!$agenteId) {
            $response = ['success' => false, 'message' => 'agente_id requerido'];
        } else {
            $properties = $agente->getAvailableProperties($agenteId);
            $response = ['success' => true, 'data' => $properties];
        }

    } elseif ($action === 'get_assigned_properties' && $method === 'GET') {
        $agenteId = $_GET['agente_id'] ?? null;
        if (!$agenteId) {
            $response = ['success' => false, 'message' => 'agente_id requerido'];
        } else {
            $properties = $agente->getAssignedProperties($agenteId);
            $response = ['success' => true, 'data' => $properties];
        }

    } elseif ($action === 'get_reviews' && $method === 'GET') {
        $agenteId = $_GET['agente_id'] ?? null;
        if (!$agenteId) {
            $response = ['success' => false, 'message' => 'agente_id requerido'];
        } else {
            $reviewsData = $agente->getReviews($agenteId);
            $response = ['success' => true, 'data' => $reviewsData];
        }

    } elseif ($action === 'add_review' && $method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['agente_id']) || !isset($data['rating']) || !isset($data['user_name'])) {
             $response = ['success' => false, 'message' => 'Datos incompletos'];
        } else {
            if ($agente->addReview($data['agente_id'], $data)) {
                $response = ['success' => true, 'message' => 'Reseña agregada correctamente'];
            } else {
                $response = ['success' => false, 'message' => 'Error al agregar reseña'];
            }
        }
    
    } elseif ($action === 'assign_property' && $method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) $data = $_POST;
        
        $agenteId = $data['agente_id'] ?? null;
        $propiedadId = $data['propiedad_id'] ?? null;
        
        if (!$agenteId || !$propiedadId) {
            $response = ['success' => false, 'message' => 'agente_id y propiedad_id requeridos'];
        } else {
            if ($agente->assignProperty($agenteId, $propiedadId)) {
                $response = ['success' => true, 'message' => 'Propiedad asignada'];
            } else {
                $response = ['success' => false, 'message' => 'Esta propiedad ya está asignada a otro agente'];
            }
        }

    } elseif ($action === 'unassign_property' && $method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) $data = $_POST;
        
        $agenteId = $data['agente_id'] ?? null;
        $propiedadId = $data['propiedad_id'] ?? null;
        
        if (!$agenteId || !$propiedadId) {
            $response = ['success' => false, 'message' => 'agente_id y propiedad_id requeridos'];
        } else {
            if ($agente->unassignProperty($agenteId, $propiedadId)) {
                $response = ['success' => true, 'message' => 'Propiedad desasignada'];
            } else {
                $response = ['success' => false, 'message' => 'Error al desasignar propiedad'];
            }
        }

    // --- Standard CRUD ---
    } elseif ($method === 'GET') {
        if (isset($_GET['id'])) {
            $result = $agente->getById($_GET['id']);
            if ($result) {
                $response = ['success' => true, 'data' => $result];
            } else {
                http_response_code(404);
                $response = ['success' => false, 'message' => 'Agente no encontrado'];
            }
        } else {
            $stmt = $agente->getAll();
            $agentes_arr = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $agentes_arr[] = $row;
            }
            $response = ['success' => true, 'data' => $agentes_arr];
        }

    } elseif ($method === 'POST') {
        error_log("🔵 [AGENTES] Iniciando POST request");
        error_log("🔵 [AGENTES] _POST data: " . print_r($_POST, true));
        error_log("🔵 [AGENTES] _FILES: " . print_r($_FILES, true));
        
        $data = $_POST;
        // Handle JSON input if no POST data
        if (empty($data)) {
            $input = json_decode(file_get_contents('php://input'), true);
            if ($input) $data = $input;
        }

        $id = $_GET['id'] ?? ($data['id'] ?? null);
        error_log("🔵 [AGENTES] ID detectado: " . ($id ?? 'null'));

        // Handle File Upload to Cloudinary
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            error_log("📸 [AGENTES] Subiendo imagen a Cloudinary...");
            $cloudName = 'dglemuw3c'; 
            $apiKey = '464125266981415';
            $apiSecret = '4E8o3GGpHktPm0hzTGsE0qOubn4';
            
            $fileTmpPath = $_FILES['imagen']['tmp_name'];
            $timestamp = time();
            $signatureParams = "timestamp=$timestamp$apiSecret";
            $signature = sha1($signatureParams);
            
            $postFields = [
                'file' => new CURLFile($fileTmpPath),
                'api_key' => $apiKey,
                'timestamp' => $timestamp,
                'signature' => $signature
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/$cloudName/image/upload");
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            
            $cloudRes = curl_exec($ch);
            $curlError = curl_error($ch);
            // curl_close() no es necesario en PHP 8.0+ y está deprecado en PHP 8.5+
            
            if ($curlError) {
                error_log("❌ [AGENTES] Error cURL: " . $curlError);
            }
            
            $cloudData = json_decode($cloudRes, true);
            error_log("📸 [AGENTES] Respuesta Cloudinary: " . print_r($cloudData, true));
            
            if (isset($cloudData['secure_url'])) {
                $data['imagen'] = $cloudData['secure_url'];
                error_log("✅ [AGENTES] Imagen subida exitosamente: " . $data['imagen']);
            } else {
                error_log("⚠️ [AGENTES] No se obtuvo URL de Cloudinary");
            }
        } elseif (isset($_FILES['imagen'])) {
            error_log("⚠️ [AGENTES] Error en archivo imagen: " . $_FILES['imagen']['error']);
        }

        if ($id) {
            error_log("✏️ [AGENTES] Actualizando agente ID: $id");
            error_log("✏️ [AGENTES] Datos a actualizar: " . print_r($data, true));
            if ($agente->update($id, $data)) {
                error_log("✅ [AGENTES] Agente actualizado exitosamente");
                if (isset($data['imagen'])) {
                    error_log("🖼️ [AGENTES] URL de imagen guardada: " . $data['imagen']);
                }
                $response = ['success' => true, 'message' => 'Agente actualizado', 'agent_id' => $id];
            } else {
                error_log("❌ [AGENTES] Error al actualizar agente");
                $response = ['success' => false, 'message' => 'Error al actualizar agente'];
            }
        } else {
            error_log("➕ [AGENTES] Creando nuevo agente");
            error_log("➕ [AGENTES] Datos a crear: " . print_r($data, true));
            $newId = $agente->create($data);
            if ($newId) {
                error_log("✅ [AGENTES] Agente creado exitosamente con ID: $newId");
                if (isset($data['imagen'])) {
                    error_log("🖼️ [AGENTES] URL de imagen guardada en BD: " . $data['imagen']);
                }
                $response = ['success' => true, 'message' => 'Agente creado', 'agent_id' => $newId];
            } else {
                error_log("❌ [AGENTES] Error al crear agente");
                $response = ['success' => false, 'message' => 'Error al crear agente'];
            }
        }

    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            if ($agente->delete($id)) {
                $response = ['success' => true, 'message' => 'Agente eliminado'];
            } else {
                $response = ['success' => false, 'message' => 'Error al eliminar agente'];
            }
        } else {
            $response = ['success' => false, 'message' => 'ID no proporcionado'];
        }

    } else {
        http_response_code(405);
        $response = ['success' => false, 'message' => 'Method Not Allowed'];
    }
} catch (Exception $e) {
    error_log("💥 [AGENTES] Exception capturada: " . $e->getMessage());
    error_log("💥 [AGENTES] Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    $response = ['success' => false, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()];
}

echo json_encode($response);
