package com.example.demo.controllers;

import com.example.demo.dtos.UserInfoDTO;
import com.example.demo.dtos.UsuarioRegistroDTO;
import com.example.demo.dtos.UsuariosPaginadosResponse;
import com.example.demo.models.Usuario;
import com.example.demo.services.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Recupera una lista de todos los usuarios registrados transformados a formato de información pública (DTO)
    @GetMapping
    public ResponseEntity<List<UserInfoDTO>> getAllUsers() {
        List<Usuario> usuarios = usuarioService.findAll();
        if (usuarios.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        List<UserInfoDTO> usersDTO = usuarios.stream()
                .map(usuarioService::toUserInfoDTO)
                .toList();

        return new ResponseEntity<>(usersDTO, HttpStatus.OK);
    }

    // Busca y retorna la información de un usuario específico utilizando su RUT como identificador
    @GetMapping("/{rut}")
    public ResponseEntity<UserInfoDTO> getUserByRut(@PathVariable String rut) {
        Optional<Usuario> usuario = usuarioService.findByRut(rut);
        return usuario.map(value -> new ResponseEntity<>(usuarioService.toUserInfoDTO(value), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Registra un nuevo usuario en el sistema y retorna sus datos confirmados tras la creación
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UsuarioRegistroDTO dto) {
        try {
            usuarioService.registerUser(dto);
            Usuario nuevoUsuario = usuarioService.findByRut(dto.getRut()).get();
            return new ResponseEntity<>(usuarioService.toUserInfoDTO(nuevoUsuario), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    // Actualiza los datos de un usuario existente identificado por su RUT
    @PutMapping("/{rut}")
    public ResponseEntity<UserInfoDTO> updateUser(@PathVariable String rut, @RequestBody UsuarioRegistroDTO dto) {
        try {
            usuarioService.update(rut, dto);
            Usuario updatedUsuario = usuarioService.findByRut(rut).get();
            return new ResponseEntity<>(usuarioService.toUserInfoDTO(updatedUsuario), HttpStatus.OK);
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(e.getStatusCode());
        }
    }

    // Elimina de forma permanente a un usuario del sistema basándose en su RUT
    // Nota: esto es una mala practica, idealmente hay que implementar safe delete y tal
    @DeleteMapping("/{rut}")
    public ResponseEntity<Void> deleteUser(@PathVariable String rut) {
        try {
            usuarioService.deleteByRut(rut);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(e.getStatusCode());
        }
    }

    // Obtiene una lista paginada de usuarios filtrados por su rol
    @GetMapping("/rol/{rol}")
    public ResponseEntity<UsuariosPaginadosResponse> obtenerUsuariosPorRolPaginados(
            @PathVariable String rol,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(usuarioService.obtenerUsuariosPorRolPaginados(rol, page, size));
    }
}