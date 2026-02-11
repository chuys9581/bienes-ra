<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Conexión a base de datos usando mysqli
$conn = new mysqli('localhost:3307', 'inmobiliaria_user', 'inmobiliaria_pass', 'inmobiliaria_db');

// Verificar conexión
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a base de datos: ' . $conn->connect_error
    ]);
    exit();
}

$conn->set_charset('utf8mb4');

// Obtener acción
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Función para verificar si existen usuarios
function hayUsuarios($conn) {
    $sql = "SELECT COUNT(*) as total FROM usuarios";
    $result = $conn->query($sql);
    if (!$result) {
        return false;
    }
    $row = $result->fetch_assoc();
    return $row['total'] > 0;
}

// Respuestas
function jsonResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

switch ($action) {
    case 'check_first_user':
        // Verificar si hay usuarios registrados
        $hasUsers = hayUsuarios($conn);
        jsonResponse(true, '', ['hasUsers' => $hasUsers]);
        break;

    case 'register':
        // Registrar nuevo usuario
        $data = json_decode(file_get_contents('php://input'), true);
        
        $username = $conn->real_escape_string($data['username'] ?? '');
        $password = $data['password'] ?? '';
        $nombre = $conn->real_escape_string($data['nombre'] ?? '');
        $email = $conn->real_escape_string($data['email'] ?? '');
        
        // Validar campos
        if (empty($username) || empty($password) || empty($nombre) || empty($email)) {
            jsonResponse(false, 'Todos los campos son requeridos');
        }
        
        // Verificar si es el primer usuario
        $esAdministrador = !hayUsuarios($conn);
        $rol = $esAdministrador ? 'administrador' : 'vendedor';
        
        // Hash de contraseña
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Insertar usuario
        $sql = "INSERT INTO usuarios (username, password, nombre, email, rol) 
                VALUES ('$username', '$passwordHash', '$nombre', '$email', '$rol')";
        
        if ($conn->query($sql)) {
            // Auto-login después de registro
            $_SESSION['user_id'] = $conn->insert_id;
            $_SESSION['username'] = $username;
            $_SESSION['nombre'] = $nombre;
            $_SESSION['rol'] = $rol;
            
            jsonResponse(true, 'Usuario registrado exitosamente', [
                'rol' => $rol,
                'username' => $username,
                'nombre' => $nombre
            ]);
        } else {
            if ($conn->errno == 1062) {
                jsonResponse(false, 'El usuario o email ya existe');
            }
            jsonResponse(false, 'Error al registrar usuario: ' . $conn->error);
        }
        break;

    case 'login':
        // Iniciar sesión
        $data = json_decode(file_get_contents('php://input'), true);
        
        $username = $conn->real_escape_string($data['username'] ?? '');
        $password = $data['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            jsonResponse(false, 'Usuario y contraseña son requeridos');
        }
        
        // Buscar usuario
        $sql = "SELECT id, username, password, nombre, email, rol, activo 
                FROM usuarios WHERE username = '$username' OR email = '$username'";
        $result = $conn->query($sql);
        
        if (!$result || $result->num_rows === 0) {
            jsonResponse(false, 'Usuario no encontrado');
        }
        
        $user = $result->fetch_assoc();
        
        // Verificar si está activo
        if (!$user['activo']) {
            jsonResponse(false, 'Usuario inactivo. Contacte al administrador');
        }
        
        // Verificar contraseña
        if (!password_verify($password, $user['password'])) {
            jsonResponse(false, 'Contraseña incorrecta');
        }
        
        // Crear sesión
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['nombre'] = $user['nombre'];
        $_SESSION['rol'] = $user['rol'];
        
        jsonResponse(true, 'Inicio de sesión exitoso', [
            'username' => $user['username'],
            'nombre' => $user['nombre'],
            'rol' => $user['rol']
        ]);
        break;

    case 'check':
        // Verificar sesión activa
        if (isset($_SESSION['user_id'])) {
            jsonResponse(true, 'Sesión activa', [
                'username' => $_SESSION['username'],
                'nombre' => $_SESSION['nombre'],
                'rol' => $_SESSION['rol']
            ]);
        } else {
            jsonResponse(false, 'No hay sesión activa');
        }
        break;

    case 'logout':
        // Cerrar sesión
        session_destroy();
        jsonResponse(true, 'Sesión cerrada exitosamente');
        break;

    default:
        jsonResponse(false, 'Acción no válida');
}

$conn->close();
?>
