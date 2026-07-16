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
		categoriaRepository.crearCategoria(categoria.getNombreCategoria());
	}

	// Actualiza el nombre de una categoria existente
	public void actualizarCategoria(Long idCategoria, Categoria categoria) {
		if (categoria == null || categoria.getNombreCategoria() == null || categoria.getNombreCategoria().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de la categoria es obligatorio");
		}
		if (categoriaRepository.buscarPorId(idCategoria).isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada");
		}
		categoriaRepository.actualizarCategoria(idCategoria, categoria.getNombreCategoria());
	}

	// Elimina una categoria si existe
	public void eliminarPorId(Long idCategoria) {
		if (categoriaRepository.buscarPorId(idCategoria).isEmpty()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada");
		}
		categoriaRepository.eliminarPorId(idCategoria);
	}
}
