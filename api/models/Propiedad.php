<?php
class Propiedad {
    private $conn;
    private $table = 'propiedades';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($filters = []) {
        $query = "SELECT p.*, tp.nombre as tipo_nombre 
                  FROM " . $this->table . " p 
                  LEFT JOIN tipo_propiedad tp ON p.tipo_propiedad_id = tp.id";
        
        $conditions = [];
        $params = [];

        if (isset($filters['tipo'])) {
            $conditions[] = "p.tipo_propiedad_id = :tipo";
            $params[':tipo'] = $filters['tipo'];
        }
        if (isset($filters['estado_propiedad'])) {
            $conditions[] = "p.estado_propiedad = :estado_propiedad";
            $params[':estado_propiedad'] = $filters['estado_propiedad'];
        }
        if (isset($filters['destacada'])) {
            $conditions[] = "p.destacada = :destacada";
            $params[':destacada'] = $filters['destacada'];
        }
        if (isset($filters['en_carousel'])) {
            $conditions[] = "p.en_carousel = :en_carousel";
            $params[':en_carousel'] = $filters['en_carousel'];
        }
        if (isset($filters['mejor_venta'])) {
            $conditions[] = "p.mejor_venta = :mejor_venta";
            $params[':mejor_venta'] = $filters['mejor_venta'];
        }

        if (count($conditions) > 0) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }

        if (isset($filters['destacada']) || isset($filters['mejor_venta'])) {
            $query .= " ORDER BY p.updated_at DESC";
        } else {
            $query .= " ORDER BY p.created_at DESC";
        }

        if (isset($filters['limit'])) {
            $query .= " LIMIT :limit";
        }

        $stmt = $this->conn->prepare($query);

        // Bind params
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        if (isset($filters['limit'])) {
            $stmt->bindValue(':limit', (int)$filters['limit'], PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt;
    }

    public function getSingle($id) {
        $query = "SELECT p.*, tp.nombre as tipo_nombre 
                  FROM " . $this->table . " p 
                  LEFT JOIN tipo_propiedad tp ON p.tipo_propiedad_id = tp.id
                  WHERE p.id = ?
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();

        return $stmt->fetch();
    }
    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  SET titulo = :titulo, 
                      descripcion = :descripcion, 
                      tipo_propiedad_id = :tipo_propiedad_id, 
                      precio = :precio, 
                      direccion = :direccion, 
                      ciudad = :ciudad, 
                      estado = :estado, 
                      habitaciones = :habitaciones, 
                      banos = :banos, 
                      estacionamientos = :estacionamientos, 
                      metros_cuadrados = :metros_cuadrados, 
                      estado_propiedad = :estado_propiedad, 
                      destacada = :destacada,
                      en_carousel = :en_carousel,
                      mejor_venta = :mejor_venta,
                      imagen_principal = :imagen_principal";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->bindParams($stmt, $data);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table . " 
                  SET titulo = :titulo, 
                      descripcion = :descripcion, 
                      tipo_propiedad_id = :tipo_propiedad_id, 
                      precio = :precio, 
                      direccion = :direccion, 
                      ciudad = :ciudad, 
                      estado = :estado, 
                      habitaciones = :habitaciones, 
                      banos = :banos, 
                      estacionamientos = :estacionamientos, 
                      metros_cuadrados = :metros_cuadrados, 
                      estado_propiedad = :estado_propiedad, 
                      destacada = :destacada,
                      en_carousel = :en_carousel,
                      mejor_venta = :mejor_venta,
                      imagen_principal = :imagen_principal
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->bindParams($stmt, $data);
        $stmt->bindValue(':id', $id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    private function bindParams($stmt, $data) {
        $stmt->bindValue(':titulo', htmlspecialchars(strip_tags($data['titulo'])));
        $stmt->bindValue(':descripcion', htmlspecialchars(strip_tags($data['descripcion'])));
        $stmt->bindValue(':tipo_propiedad_id', $data['tipo_propiedad_id']);
        $stmt->bindValue(':precio', $data['precio']);
        $stmt->bindValue(':direccion', htmlspecialchars(strip_tags($data['direccion'])));
        $stmt->bindValue(':ciudad', htmlspecialchars(strip_tags($data['ciudad'])));
        $stmt->bindValue(':estado', htmlspecialchars(strip_tags($data['estado'])));
        $stmt->bindValue(':habitaciones', $data['habitaciones']);
        $stmt->bindValue(':banos', $data['banos']);
        $stmt->bindValue(':estacionamientos', $data['estacionamientos']);
        $stmt->bindValue(':metros_cuadrados', $data['metros_cuadrados']);
        $stmt->bindValue(':estado_propiedad', $data['estado_propiedad']);
        $stmt->bindValue(':destacada', $data['destacada'], PDO::PARAM_BOOL);
        $stmt->bindValue(':en_carousel', isset($data['en_carousel']) ? $data['en_carousel'] : 0, PDO::PARAM_BOOL);
        $stmt->bindValue(':mejor_venta', isset($data['mejor_venta']) ? $data['mejor_venta'] : 0, PDO::PARAM_BOOL);
        $stmt->bindValue(':imagen_principal', htmlspecialchars(strip_tags($data['imagen_principal'])));
    }
}
?>
