<?php
// Middleware de autenticación
session_start();

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'No autenticado. Debe iniciar sesión'
        ]);
        exit;
    }
}

function requireAdmin() {
    requireAuth();
    if ($_SESSION['rol'] !== 'administrador') {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Acceso denegado. Se requieren permisos de administrador'
        ]);
        exit;
    }
}

function getCurrentUser() {
    if (isset($_SESSION['user_id'])) {
        return [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'nombre' => $_SESSION['nombre'],
            'rol' => $_SESSION['rol']
        ];
    }
    return null;
}
?>
