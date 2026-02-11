<?php
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
        $data = $_POST;
        if (empty($data)) {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
        }
        $id = $_GET['id'] ?? ($data['id'] ?? null);

        if ($id) {
            if ($agente->update($id, $data)) {
                $response = ['success' => true, 'message' => 'Agente actualizado'];
            } else {
                $response = ['success' => false, 'message' => 'Error al actualizar agente'];
            }
        } else {
            if ($agente->create($data)) {
                $response = ['success' => true, 'message' => 'Agente creado'];
            } else {
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
    http_response_code(500);
    $response = ['success' => false, 'error' => $e->getMessage()];
}

echo json_encode($response);
