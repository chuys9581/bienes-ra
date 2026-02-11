<?php
header('Content-Type: text/plain');
include_once 'api/config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    $query = "DESCRIBE propiedades";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . " - " . $row['Type'] . "\n";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
