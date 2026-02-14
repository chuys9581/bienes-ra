<?php
header('Content-Type: text/plain');
include_once 'api/config/Database.php';

$database = new Database();
$db = $database->connect();

try {
    // Check if column exists
    $checkQuery = "SHOW COLUMNS FROM propiedades LIKE 'mejor_renta'";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute();

    if ($checkStmt->rowCount() == 0) {
        // Add column if it doesn't exist
        $query = "ALTER TABLE propiedades ADD COLUMN mejor_renta TINYINT(1) DEFAULT 0 AFTER mejor_venta";
        $stmt = $db->prepare($query);
        
        if($stmt->execute()) {
            echo "Column 'mejor_renta' added successfully.\n";
        } else {
            echo "Error adding column.\n";
            print_r($stmt->errorInfo());
        }
    } else {
        echo "Column 'mejor_renta' already exists.\n";
    }

    // Verify
    echo "\nCurrent Schema:\n";
    $query = "DESCRIBE propiedades";
    $stmt = $db->prepare($query);
    $stmt->execute();
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . " - " . $row['Type'] . "\n";
    }

} catch(PDOException $e) {
    echo "Database Error: " . $e->getMessage();
}
?>
