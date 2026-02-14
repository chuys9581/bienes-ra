<?php
class Agente {
    private $conn;
    private $table = 'agentes';
    private $pivotTable = 'agente_propiedades';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT a.*, 
                    (SELECT COUNT(*) FROM {$this->pivotTable} ap WHERE ap.agente_id = a.id) as total_propiedades
                  FROM {$this->table} a 
                  ORDER BY a.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT a.*, 
                    (SELECT COUNT(*) FROM {$this->pivotTable} ap WHERE ap.agente_id = a.id) as total_propiedades
                  FROM {$this->table} a 
                  WHERE a.id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} 
                  SET nombre = :nombre,
                      apellido = :apellido,
                      email = :email,
                      telefono = :telefono,
                      cargo = :cargo,
                      imagen = :imagen,
                      antiguedad = :antiguedad,
                      activo = :activo";

        $stmt = $this->conn->prepare($query);
        $this->bindParams($stmt, $data);

        return $stmt->execute();
    }

    public function update($id, $data) {
        $query = "UPDATE {$this->table} 
                  SET nombre = :nombre,
                      apellido = :apellido,
                      email = :email,
                      telefono = :telefono,
                      cargo = :cargo,
                      imagen = :imagen,
                      antiguedad = :antiguedad,
                      activo = :activo
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $this->bindParams($stmt, $data);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    // --- Property Assignment ---

    public function getAssignedProperties($agenteId) {
        $query = "SELECT p.id, p.titulo, p.ciudad, p.estado, p.precio, p.estado_propiedad, 
                         p.imagen_principal, tp.nombre as tipo_nombre,
                         p.habitaciones, p.banos, p.metros_cuadrados,
                         ap.assigned_at
                  FROM {$this->pivotTable} ap
                  INNER JOIN propiedades p ON ap.propiedad_id = p.id
                  LEFT JOIN tipo_propiedad tp ON p.tipo_propiedad_id = tp.id
                  WHERE ap.agente_id = :agente_id
                  ORDER BY ap.assigned_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':agente_id', $agenteId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Get properties available for a specific agent:
     * - Properties assigned to THIS agent (checked)
     * - Properties NOT assigned to ANY agent (available)
     * Properties assigned to OTHER agents are excluded.
     */
    public function getAvailableProperties($agenteId) {
        $query = "SELECT p.id, p.titulo, p.ciudad, p.estado, p.precio, p.estado_propiedad,
                         p.imagen_principal, tp.nombre as tipo_nombre,
                         p.habitaciones, p.banos, p.metros_cuadrados,
                         CASE WHEN ap_mine.agente_id IS NOT NULL THEN 1 ELSE 0 END as asignada
                  FROM propiedades p
                  LEFT JOIN tipo_propiedad tp ON p.tipo_propiedad_id = tp.id
                  LEFT JOIN {$this->pivotTable} ap_mine 
                      ON ap_mine.propiedad_id = p.id AND ap_mine.agente_id = :agente_id
                  LEFT JOIN {$this->pivotTable} ap_other 
                      ON ap_other.propiedad_id = p.id AND ap_other.agente_id != :agente_id2
                  WHERE ap_other.agente_id IS NULL
                  ORDER BY asignada DESC, p.titulo ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':agente_id', $agenteId, PDO::PARAM_INT);
        $stmt->bindValue(':agente_id2', $agenteId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function assignProperty($agenteId, $propiedadId) {
        // Check if already assigned to another agent
        $check = "SELECT agente_id FROM {$this->pivotTable} WHERE propiedad_id = :propiedad_id";
        $stmt = $this->conn->prepare($check);
        $stmt->bindValue(':propiedad_id', $propiedadId, PDO::PARAM_INT);
        $stmt->execute();
        $existing = $stmt->fetch();

        if ($existing && $existing['agente_id'] != $agenteId) {
            return false; // Already assigned to another agent
        }

        $query = "INSERT IGNORE INTO {$this->pivotTable} (agente_id, propiedad_id) VALUES (:agente_id, :propiedad_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':agente_id', $agenteId, PDO::PARAM_INT);
        $stmt->bindValue(':propiedad_id', $propiedadId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function unassignProperty($agenteId, $propiedadId) {
        $query = "DELETE FROM {$this->pivotTable} WHERE agente_id = :agente_id AND propiedad_id = :propiedad_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':agente_id', $agenteId, PDO::PARAM_INT);
        $stmt->bindValue(':propiedad_id', $propiedadId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    // --- Reviews ---

    public function getReviews($agenteId) {
        $query = "SELECT * FROM reviews WHERE agente_id = :agente_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':agente_id', $agenteId, PDO::PARAM_INT);
        $stmt->execute();
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate average
        $avgQuery = "SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE agente_id = :agente_id";
        $stmtAvg = $this->conn->prepare($avgQuery);
        $stmtAvg->bindValue(':agente_id', $agenteId, PDO::PARAM_INT);
        $stmtAvg->execute();
        $stats = $stmtAvg->fetch(PDO::FETCH_ASSOC);

        return [
            'reviews' => $reviews,
            'stats' => $stats
        ];
    }

    public function addReview($agenteId, $data) {
        $query = "INSERT INTO reviews (agente_id, user_name, rating, comment) VALUES (:agente_id, :user_name, :rating, :comment)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':agente_id', $agenteId, PDO::PARAM_INT);
        $stmt->bindValue(':user_name', htmlspecialchars(strip_tags($data['user_name'])));
        $stmt->bindValue(':rating', (int)$data['rating'], PDO::PARAM_INT);
        $stmt->bindValue(':comment', htmlspecialchars(strip_tags($data['comment'])));
        return $stmt->execute();
    }

    private function bindParams($stmt, $data) {
        $stmt->bindValue(':nombre', htmlspecialchars(strip_tags($data['nombre'] ?? '')));
        $stmt->bindValue(':apellido', htmlspecialchars(strip_tags($data['apellido'] ?? '')));
        $stmt->bindValue(':email', htmlspecialchars(strip_tags($data['email'] ?? '')));
        $telefono = substr(preg_replace('/[^0-9]/', '', $data['telefono'] ?? ''), 0, 10);
        $stmt->bindValue(':telefono', $telefono);
        $stmt->bindValue(':cargo', htmlspecialchars(strip_tags($data['cargo'] ?? '')));
        $stmt->bindValue(':imagen', htmlspecialchars(strip_tags($data['imagen'] ?? '')));
        $stmt->bindValue(':antiguedad', htmlspecialchars(strip_tags($data['antiguedad'] ?? '')));
        $stmt->bindValue(':activo', isset($data['activo']) ? (int)$data['activo'] : 1, PDO::PARAM_INT);
    }
}
?>
