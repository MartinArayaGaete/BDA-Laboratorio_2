package com.example.demo.repositories;

import com.example.demo.models.CategoriaAmbiental;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class CategoriaAmbientalRepository {

    private final JdbcTemplate jdbcTemplate;

    public CategoriaAmbientalRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private CategoriaAmbiental mapRowToCategoriaAmbiental(ResultSet rs) throws SQLException {
        CategoriaAmbiental categoria = new CategoriaAmbiental();
        categoria.setIdCategoriaAmbiental(rs.getLong("id_categoria_ambiental"));
        categoria.setCategoriaAmbiental(rs.getString("categoria_ambiental"));
        return categoria;
    }

    // obtener todas las categorías ambientales
    public List<CategoriaAmbiental> obtenerTodas() {
        String sql = "SELECT id_categoria_ambiental, categoria_ambiental FROM categoria_ambiental";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToCategoriaAmbiental(rs));
    }

    // crear una nueva categoría ambiental
    public int crearCategoria(CategoriaAmbiental categoria) {
        String sql = "INSERT INTO categoria_ambiental (categoria_ambiental) VALUES (?)";
        return jdbcTemplate.update(sql, categoria.getCategoriaAmbiental());
    }

    // eliminar una categoría ambiental por su id
    public int eliminarCategoria(Long id) {
        String sql = "DELETE FROM categoria_ambiental WHERE id_categoria_ambiental = ?";
        return jdbcTemplate.update(sql, id);
    }
}