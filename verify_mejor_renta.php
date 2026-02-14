<?php
header('Content-Type: text/plain');
include_once 'api/config/Database.php';
include_once 'api/models/Propiedad.php';

$database = new Database();
$db = $database->connect();
$propiedad = new Propiedad($db);

echo "Testing creation with mejor_renta = 1...\n";

$testData = [
    'titulo' => 'Test Property Mejor Renta',
    'descripcion' => 'Description test',
    'tipo_propiedad_id' => 1,
    'precio' => 10000,
    'direccion' => 'Test Address',
    'ciudad' => 'Test City',
    'estado' => 'Test State',
    'habitaciones' => 2,
    'banos' => 1,
    'estacionamientos' => 1,
    'metros_cuadrados' => 100,
    'estado_propiedad' => 'renta',
    'destacada' => 0,
    'en_carousel' => 0,
    'mejor_venta' => 0,
    'mejor_renta' => 1,
    'imagen_principal' => 'test.jpg'
];

if($propiedad->create($testData)) {
    echo "Property created.\n";
    $query = "SELECT * FROM propiedades WHERE titulo = 'Test Property Mejor Renta' ORDER BY id DESC LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "mejor_renta value in DB: " . $row['mejor_renta'] . "\n";
    
    if($row['mejor_renta'] == 1) {
        echo "SUCCESS: mejor_renta saved correctly.\n";
    } else {
        echo "FAIL: mejor_renta not saved correctly.\n";
    }
    
    // Cleanup
    $propiedad->delete($row['id']);
    echo "Test property deleted.\n";
} else {
    echo "Failed to create property.\n";
}
?>
