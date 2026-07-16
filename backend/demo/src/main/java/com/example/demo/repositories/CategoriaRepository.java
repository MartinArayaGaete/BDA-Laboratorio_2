package com.example.demo.repositories;

import com.example.demo.models.Categoria;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class CategoriaRepository {

	private final JdbcTemplate jdbcTemplate;

	public CategoriaRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	private Categoria mapRowToCategoria(ResultSet rs) throws SQLException {
		Categoria c = new Categoria();
		c.setIdCategoria(rs.getLong("id_categoria"));
		c.setNombreCategoria(rs.getString("nombre_categoria"));
		return c;
	}

	// Recupera todas las categorias desde la base de datos
	public List<Categoria> obtenerTodas() {
		String sql = "SELECT id_categoria, nombre_categoria FROM categoria";
		return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToCategoria(rs));
	}

	// Busca una categoria por su identificador
	public Optional<Categoria> buscarPorId(Long idCategoria) {
		String sql = "SELECT id_categoria, nombre_categoria FROM categoria WHERE id_categoria = ?";
		try {
			Categoria categoria = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> mapRowToCategoria(rs), idCategoria);
			return Optional.ofNullable(categoria);
		} catch (EmptyResultDataAccessException e) {
			return Optional.empty();
		}
	}

	// Inserta una nueva categoria
	public void crearCategoria(String nombreCategoria) {
		String sql = "INSERT INTO categoria (nombre_categoria) VALUES (?)";
		jdbcTemplate.update(sql, nombreCategoria);
	}

	// Actualiza el nombre de una categoria existente
	public void actualizarCategoria(Long idCategoria, String nombreCategoria) {
		String sql = "UPDATE categoria SET nombre_categoria = ? WHERE id_categoria = ?";
		jdbcTemplate.update(sql, nombreCategoria, idCategoria);
	}

	// Elimina una categoria por su identificador
	public void eliminarPorId(Long idCategoria) {
		String sql = "DELETE FROM categoria WHERE id_categoria = ?";
		jdbcTemplate.update(sql, idCategoria);
	}
}
