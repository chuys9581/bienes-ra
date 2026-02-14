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
            $result = $propiedad->getSingle($_GET['id']);
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
                'mejor_venta' => $_GET['mejor_venta'] ?? null,
                'mejor_renta' => $_GET['mejor_renta'] ?? null,
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
        
        $action = isset($_GET['action']) ? $_GET['action'] : null;

        if ($action === 'delete_image') {
            // Delete specific image
            $data = json_decode(file_get_contents("php://input"));
            $imageId = isset($data->image_id) ? $data->image_id : null;

            if ($imageId) {
                if ($propiedad->deleteImage($imageId)) {
                    $response = ['success' => true, 'message' => 'Imagen eliminada'];
                } else {
                    $response = ['success' => false, 'message' => 'Error al eliminar imagen'];
                }
            } else {
                $response = ['success' => false, 'message' => 'ID de imagen no proporcionado'];
            }

        } else {
            // Create or Update Property
            $data = $_POST;
            $id = isset($_GET['id']) ? $_GET['id'] : (isset($data['id']) ? $data['id'] : null);
            
            // Cloudinary Config
            $cloudName = 'dglemuw3c'; 
            $apiKey = '464125266981415';
            $apiSecret = '4E8o3GGpHktPm0hzTGsE0qOubn4';
            $cloudinaryUrl = "https://api.cloudinary.com/v1_1/$cloudName/image/upload";

            $uploadedImages = [];
            $mainImageUrl = null;

            // Handle Single File (Old compatibility or specific field)
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                $imageUrl = uploadToCloudinary($_FILES['imagen']['tmp_name'], $cloudinaryUrl, $apiKey, $apiSecret);
                if ($imageUrl) {
                    $data['imagen_principal'] = $imageUrl;
                    $mainImageUrl = $imageUrl;
                }
            }
            
            // Handle Multiple Files (imagenes[])
            // Note: PHP structure for multiple files is $_FILES['imagenes']['name'][i], etc.
            if (isset($_FILES['imagenes'])) {
                $fileCount = count($_FILES['imagenes']['name']);
                for ($i = 0; $i < $fileCount; $i++) {
                    if ($_FILES['imagenes']['error'][$i] === UPLOAD_ERR_OK) {
                        $tmpPath = $_FILES['imagenes']['tmp_name'][$i];
                        $url = uploadToCloudinary($tmpPath, $cloudinaryUrl, $apiKey, $apiSecret);
                        if ($url) {
                            $uploadedImages[] = $url;
                        }
                    }
                }
            }

            // If main image was set via single file upload, ensure it's in the list too if we want (optional)
            // But requirement says "first is main".
            // If user uploaded via 'imagenes[]', take the first one as main IF main not already set.
            
            if (empty($data['imagen_principal']) && !empty($uploadedImages)) {
                $data['imagen_principal'] = $uploadedImages[0];
            }
            
            // Pass all new images to model
            $data['imagenes'] = $uploadedImages;
            
            if ($id) {
                // Update
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

// Helper function
function uploadToCloudinary($filePath, $url, $apiKey, $apiSecret) {
     $timestamp = time();
     $signatureParams = "timestamp=$timestamp$apiSecret";
     $signature = sha1($signatureParams);
    
    $postFields = [
        'file' => new CURLFile($filePath),
        'api_key' => $apiKey,
        'timestamp' => $timestamp,
        'signature' => $signature
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $cloudRes = curl_exec($ch);
    curl_close($ch);
    
    $cloudData = json_decode($cloudRes, true);
    
    if (isset($cloudData['secure_url'])) {
        return $cloudData['secure_url'];
    }
    return null;
}
?>
