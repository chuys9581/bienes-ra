<?php
// Prevent any HTML output/warnings
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Buffer output to catch any stray warnings
ob_start();

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

$response = ['success' => false];

try {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $cloudName = 'dglemuw3c'; 
        $apiKey = '464125266981415';
        $apiSecret = '4E8o3GGpHktPm0hzTGsE0qOubn4';
        
        $fileTmpPath = $_FILES['file']['tmp_name'];
        if (!file_exists($fileTmpPath)) {
            throw new Exception("El archivo temporal no existe.");
        }

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
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Fix for local SSL issues
        
        $cloudRes = curl_exec($ch);
        
        if (curl_errno($ch)) {
            throw new Exception("Curl Error: " . curl_error($ch));
        }
        
        curl_close($ch);
        
        $cloudData = json_decode($cloudRes, true);
        
        if (isset($cloudData['secure_url'])) {
            $response = [
                'success' => true,
                'url' => $cloudData['secure_url']
            ];
        } else {
            $response = [
                'success' => false, 
                'message' => 'Error al subir a Cloudinary', 
                'details' => $cloudData,
                'raw' => $cloudRes
            ];
        }
    } else {
        $errCode = isset($_FILES['file']) ? $_FILES['file']['error'] : 'No file sent';
        $response = ['success' => false, 'message' => 'No se recibió archivo válido', 'error_code' => $errCode];
    }
} catch (Exception $e) {
    $response = ['success' => false, 'error' => $e->getMessage()];
}

// Clean buffer and output only JSON
ob_end_clean();
echo json_encode($response);
?>
