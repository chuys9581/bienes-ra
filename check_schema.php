<?php
header('Content-Type: text/plain');
include_once 'api/config/Database.php';

$database = new Database();
$db = $database->connect();

echo "--- Table: agentes ---\n";
$query = "DESCRIBE agentes";
$stmt = $db->prepare($query);
$stmt->execute();
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
?>
