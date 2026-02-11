<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once 'config/Database.php';
include_once 'models/Propiedad.php';

// Instantiate DB & Connect
$database = new Database();
$db = $database->connect();

// Instantiate Blog Post object
$propiedad = new Propiedad($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false];

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            // Get Single
            $result = $propiedad->getById($_GET['id']);
            if ($result) {
                $response = ['success' => true, 'data' => $result];
            } else {
                http_response_code(404);
                $response = ['success' => false, 'message' => 'Propiedad no encontrada'];
            }
        } else {
            // Get All
            $filters = [
                'tipo' => $_GET['tipo'] ?? null,
                'estado_propiedad' => $_GET['estado_propiedad'] ?? null,
                'destacada' => $_GET['destacada'] ?? null,
                'en_carousel' => $_GET['en_carousel'] ?? null,
                'limit' => $_GET['limit'] ?? null
            ];
            
            // Remove nulls
            $filters = array_filter($filters, function($value) { return !is_null($value) && $value !== ''; });

            $stmt = $propiedad->getAll($filters);
            $num = $stmt->rowCount();

            if ($num > 0) {
                $propiedades_arr = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    array_push($propiedades_arr, $row);
                }
                $response = ['success' => true, 'data' => $propiedades_arr];
            } else {
                $response = ['success' => true, 'data' => []];
            }
        }
    } elseif ($method === 'POST') {
        // Check if it's an update (method override or just logic)
        // We'll support both raw POST for create and POST with 'id' or _method for update if needed.
        // For simplicity: If 'id' is in $_GET or $_POST, treat as Update, else Create.
        
        $data = $_POST;
        $id = isset($_GET['id']) ? $_GET['id'] : (isset($data['id']) ? $data['id'] : null);
        
        // Handle File Upload to Cloudinary
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $cloudName = 'dglemuw3c'; 
            $uploadPreset = 'ml_default'; // Using unsigned upload or signed? 
            // Since user gave API Key/Secret, let's do signed upload via CURL for security/robustness
            // OR simple unsigned if preset exists. 
            // Given we have Key/Secret, let's try a robust upload using API.
            
            $fileTmpPath = $_FILES['imagen']['tmp_name'];
            
            // Cloudinary API URL
            $cloudinaryUrl = "https://api.cloudinary.com/v1_1/$cloudName/image/upload";
            
            $postFields = [
                'file' => new CURLFile($fileTmpPath),
                'upload_preset' => 'unsigned_preset', // If we don't know preset, we might need one.
                // Fallback: If user didn't give preset, we use API Key/Secret for signed upload?
                // Signed upload is complex without a library.
                // Let's assume we can use the API Key/Secret for Basic Auth or similar?
                // Actually, simplest is "unsigned" but we need a preset.
                // As we don't have a preset, let's try to use the API Key/Secret to sign?
                // Too complex for single file. 
                // BETTER APPROACH: Use the user's API Key and Secret.
            ];
            
            // Timestamp and Signature calculation for Signed Upload
            $timestamp = time();
            $apiKey = '464125266981415';
            $apiSecret = '4E8o3GGpHktPm0hzTGsE0qOubn4';
            
            $signatureParams = "timestamp=$timestamp$apiSecret";
            $signature = sha1($signatureParams);
            
            $postFields = [
                'file' => new CURLFile($fileTmpPath),
                'api_key' => $apiKey,
                'timestamp' => $timestamp,
                'signature' => $signature
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $cloudinaryUrl);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            
            $cloudRes = curl_exec($ch);
            curl_close($ch);
            
            $cloudData = json_decode($cloudRes, true);
            
            if (isset($cloudData['secure_url'])) {
                $data['imagen_principal'] = $cloudData['secure_url'];
            }
        }
        
        if ($id) {
            // Update
            // If no new image, we might need to keep old one. 
            // The frontend should send the old URL if no new file is selected, OR we fetch it.
            // For simplicity, if image not uploaded, keep what's in 'imagen_principal' from POST body.
            
            if ($propiedad->update($id, $data)) {
                $response = ['success' => true, 'message' => 'Propiedad actualizada'];
            } else {
                $response = ['success' => false, 'message' => 'Error al actualizar'];
            }
        } else {
            // Create
            if ($propiedad->create($data)) {
                $response = ['success' => true, 'message' => 'Propiedad creada'];
            } else {
                $response = ['success' => false, 'message' => 'Error al crear'];
            }
        }
        
    } elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if ($id) {
            if ($propiedad->delete($id)) {
                $response = ['success' => true, 'message' => 'Propiedad eliminada'];
            } else {
                $response = ['success' => false, 'message' => 'Error al eliminar'];
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
