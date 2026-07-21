package com.example.demo.services;

import com.example.demo.models.Categoria;
import com.example.demo.repositories.CategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

	private final CategoriaRepository categoriaRepository;

	public CategoriaService(CategoriaRepository categoriaRepository) {
		this.categoriaRepository = categoriaRepository;
	}

	// Retorna todas las categorias disponibles
	public List<Categoria> obtenerTodas() {
		return categoriaRepository.obtenerTodas();
	}

	// Retorna una categoria por id si existe
	public Optional<Categoria> buscarPorId(Long idCategoria) {
		return categoriaRepository.buscarPorId(idCategoria);
	}

	// Crea una categoria validando que el nombre no este vacio
	public void crearCategoria(Categoria categoria) {
		if (categoria == null || categoria.getNombreCategoria() == null || categoria.getNombreCategoria().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la categoria es obligatorio");
		}
		if (categoria.getDistanciaTiro() != null && categoria.getDistanciaTiro() < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La distancia de tiro no puede ser negativa");
		}
		categoriaRepository.crearCategoria(categoria.getNombreCategoria(), categoria.getDistanciaTiro());
	}

	// Actualiza el nombre y la distancia de una categoria existente
	public void actualizarCategoria(Long idCategoria, Categoria categoria) {
		if (categoria == null || categoria.getNombreCategoria() == null || categoria.getNombreCategoria().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la categoria es obligatorio");
		}
		if (categoria.getDistanciaTiro() != null && categoria.getDistanciaTiro() < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La distancia de tiro no puede ser negativa");
		}
		if (categoriaRepository.buscarPorId(idCategoria).isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada");
		}
		categoriaRepository.actualizarCategoria(idCategoria, categoria.getNombreCategoria(), categoria.getDistanciaTiro());
	}

	// Elimina una categoria si existe
	public void eliminarPorId(Long idCategoria) {
		if (categoriaRepository.buscarPorId(idCategoria).isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada");
		}
		categoriaRepository.eliminarPorId(idCategoria);
	}
}
