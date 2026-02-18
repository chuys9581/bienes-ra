<?php
// Suprimir warnings deprecados para evitar que rompan las respuestas JSON
error_reporting(E_ALL & ~E_DEPRECATED);

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
        
        error_log("🚀 POST Request recibido");
        error_log("📋 POST data: " . print_r($_POST, true));
        error_log("📷 FILES data: " . print_r($_FILES, true));
        
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
            error_log("✏️ Procesando crear/actualizar propiedad");
            $data = $_POST;
            $id = isset($_GET['id']) ? $_GET['id'] : (isset($data['id']) ? $data['id'] : null);
            
            error_log("🆔 Property ID: " . ($id ?? 'nuevo'));
            
            // Cloudinary Config
            $cloudName = 'dglemuw3c'; 
            $apiKey = '464125266981415';
            $apiSecret = '4E8o3GGpHktPm0hzTGsE0qOubn4';
            $cloudinaryUrl = "https://api.cloudinary.com/v1_1/$cloudName/image/upload";

            $uploadedImages = [];
            $mainImageUrl = null;

            // Handle Single File (Old compatibility or specific field)
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                error_log("📤 Subiendo imagen única a Cloudinary...");
                $imageUrl = uploadToCloudinary($_FILES['imagen']['tmp_name'], $cloudinaryUrl, $apiKey, $apiSecret);
                if ($imageUrl) {
                    $data['imagen_principal'] = $imageUrl;
                    $mainImageUrl = $imageUrl;
                    error_log("✅ Imagen única subida: " . $imageUrl);
                }
            }
            
            // Handle Multiple Files (imagenes[])
            // Note: PHP structure for multiple files is $_FILES['imagenes']['name'][i], etc.
            if (isset($_FILES['imagenes'])) {
                error_log("📤 Procesando múltiples imágenes...");
                $fileCount = count($_FILES['imagenes']['name']);
                error_log("📷 Total de archivos: " . $fileCount);
                
                for ($i = 0; $i < $fileCount; $i++) {
                    if ($_FILES['imagenes']['error'][$i] === UPLOAD_ERR_OK) {
                        $tmpPath = $_FILES['imagenes']['tmp_name'][$i];
                        $fileName = $_FILES['imagenes']['name'][$i];
                        $fileSize = $_FILES['imagenes']['size'][$i];
                        
                        error_log("📷 Subiendo imagen $i: $fileName (" . round($fileSize/1024, 2) . " KB)");
                        
                        $url = uploadToCloudinary($tmpPath, $cloudinaryUrl, $apiKey, $apiSecret);
                        if ($url) {
                            $uploadedImages[] = $url;
                            error_log("✅ Imagen $i subida exitosamente: " . $url);
                        } else {
                            error_log("❌ Error al subir imagen $i: $fileName");
                        }
                    } else {
                        error_log("⚠️ Error en archivo $i: " . $_FILES['imagenes']['error'][$i]);
                    }
                }
                
                error_log("📦 Total de imágenes subidas: " . count($uploadedImages));
            }

            // If main image was set via single file upload, ensure it's in the list too if we want (optional)
            // But requirement says "first is main".
            // If user uploaded via 'imagenes[]', take the first one as main IF main not already set.
            
            if (empty($data['imagen_principal']) && !empty($uploadedImages)) {
                $data['imagen_principal'] = $uploadedImages[0];
                error_log("🖼️ Estableciendo primera imagen como principal: " . $data['imagen_principal']);
            }
            
            // Pass all new images to model
            $data['imagenes'] = $uploadedImages;
            
            error_log("💾 Guardando en base de datos...");
            error_log("📋 Data a guardar: " . print_r($data, true));
            
            if ($id) {
                // Update
                error_log("✏️ Actualizando propiedad ID: " . $id);
                if ($propiedad->update($id, $data)) {
                    error_log("✅ Propiedad actualizada exitosamente");
                    $response = ['success' => true, 'message' => 'Propiedad actualizada'];
                } else {
                    error_log("❌ Error al actualizar propiedad");
                    $response = ['success' => false, 'message' => 'Error al actualizar'];
                }
            } else {
                // Create
                error_log("➕ Creando nueva propiedad");
                if ($propiedad->create($data)) {
                    error_log("✅ Propiedad creada exitosamente");
                    $response = ['success' => true, 'message' => 'Propiedad creada'];
                } else {
                    error_log("❌ Error al crear propiedad");
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
    error_log("❌ Exception caught: " . $e->getMessage());
    error_log("❌ Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    $response = ['success' => false, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()];
}

echo json_encode($response);

// Helper function
function uploadToCloudinary($filePath, $url, $apiKey, $apiSecret) {
    error_log("☁️ Subiendo a Cloudinary: " . $filePath);
    
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
    $curlError = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    // curl_close() is a no-op since PHP 8.0 and deprecated since 8.5
    unset($ch);
    
    error_log("☁️ Cloudinary HTTP Code: " . $httpCode);
    
    if ($curlError) {
        error_log("❌ cURL Error: " . $curlError);
        return null;
    }
    
    error_log("☁️ Cloudinary Response: " . $cloudRes);
    
    $cloudData = json_decode($cloudRes, true);
    
    if (isset($cloudData['secure_url'])) {
        error_log("✅ Upload exitoso: " . $cloudData['secure_url']);
        return $cloudData['secure_url'];
    }
    
    if (isset($cloudData['error'])) {
        error_log("❌ Cloudinary Error: " . print_r($cloudData['error'], true));
    }
    
    return null;
}
?>
