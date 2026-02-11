<?php
header('Content-Type: text/plain');
include_once 'api/config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    // Add en_carousel column
    // TINYINT(1) default 0
    $query = "ALTER TABLE propiedades ADD COLUMN en_carousel TINYINT(1) DEFAULT 0 AFTER destacada";
    $stmt = $db->prepare($query);
    
    if($stmt->execute()) {
        echo "Successfully added 'en_carousel' column.\n";
    } else {
        echo "Error adding column (might already exist?)\n";
        print_r($stmt->errorInfo());
    }
    
} catch(PDOException $e) {
    echo "Deletion Error: " . $e->getMessage();
}
?>
