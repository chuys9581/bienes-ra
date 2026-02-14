<?php
header('Content-Type: text/plain');
include_once 'api/config/Database.php';

$database = new Database();
$db = $database->connect();

echo "Migrating 'agentes' table...\n";

try {
    // Check if column exists
    $check = "SHOW COLUMNS FROM agentes LIKE 'imagen'";
    $stmt = $db->prepare($check);
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
        // Add column
        $sql = "ALTER TABLE agentes ADD COLUMN imagen VARCHAR(255) DEFAULT NULL AFTER cargo";
        $db->exec($sql);
        echo "Column 'imagen' added successfully.\n";
    } else {
        echo "Column 'imagen' already exists.\n";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "Done.\n";
?>
