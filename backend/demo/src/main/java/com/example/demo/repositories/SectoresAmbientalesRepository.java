package com.example.demo.repositories;

import com.example.demo.models.SectoresAmbientales;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class SectoresAmbientalesRepository {

    private final JdbcTemplate jdbcTemplate;

    public SectoresAmbientalesRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private SectoresAmbientales mapRowToSectoresAmbientales(ResultSet rs) throws SQLException {
        SectoresAmbientales sector = new SectoresAmbientales();
        sector.setIdZonaAmbiental(rs.getLong("id_zona_ambiental"));
        sector.setIdCategoriaAmbiental(rs.getLong("id_categoria_ambiental"));
        sector.setTerritorio(rs.getString("territorio")); 
        return sector;
    }

    public List<SectoresAmbientales> obtenerTodos() {
        String sql = "SELECT id_zona_ambiental, id_categoria_ambiental, " +
                     "ST_AsGeoJSON(territorio) AS territorio " +
                     "FROM sectores_ambientales";                   
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToSectoresAmbientales(rs));
    }

    // crear un nuevo sector ambiental en la base de datos
    public int crearSector(SectoresAmbientales sector) {
        String sql = "INSERT INTO sectores_ambientales (id_categoria_ambiental, territorio) " +
                     "VALUES (?, ST_GeomFromGeoJSON(?))";
        return jdbcTemplate.update(sql, 
                sector.getIdCategoriaAmbiental(), 
                sector.getTerritorio());
    }

    // eliminar un sector ambiental de la base de datos por su id
    public int eliminarSector(Long id) {
        String sql = "DELETE FROM sectores_ambientales WHERE id_zona_ambiental = ?";
        return jdbcTemplate.update(sql, id);
    }
}