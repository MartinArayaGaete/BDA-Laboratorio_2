package com.example.demo.services;

import com.example.demo.dtos.UserInfoDTO;
import com.example.demo.dtos.UsuarioRegistroDTO;
import com.example.demo.dtos.UsuariosPaginadosResponse;
import com.example.demo.models.Usuario;
import com.example.demo.repositories.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    // private final PasswordEncoder passwordEncoder; // desactivado el bcrypt para pruebas

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> findAll() {
        return usuarioRepository.obtenerTodos();
    }

    public Optional<Usuario> findByRut(String rut) {
        return usuarioRepository.buscarPorRut(rut);
    }

    public void registerUser(UsuarioRegistroDTO dto) {
        if (usuarioRepository.existePorRut(dto.getRut())) {
            throw new IllegalArgumentException("El RUT ya está registrado");
        }
        String passwordPlana = dto.getContrasena();
        usuarioRepository.crearUsuario(dto.getRut(), dto.getNombre(), dto.getCorreo(), passwordPlana, dto.getRol());
    }

    public void update(String rut, UsuarioRegistroDTO dto) {
        if (!usuarioRepository.existePorRut(rut)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
        String passwordPlana = dto.getContrasena();
        usuarioRepository.actualizarUsuario(rut, dto.getNombre(), dto.getCorreo(), passwordPlana, dto.getRol());
    }

    public void deleteByRut(String rut) {
        if (usuarioRepository.existePorRut(rut)) {
            usuarioRepository.eliminarPorRut(rut);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
    }

    public Optional<Usuario> validarLogin(String rut, String rawPassword) {
        String rutLimpio = rut.replace(".", "").replace(",", "").trim().toUpperCase();

        Optional<Usuario> usuarioOpt = usuarioRepository.buscarPorRut(rutLimpio);

        if (usuarioOpt.isEmpty()) {
            System.out.println("Login fallido: RUT " + rutLimpio + " no encontrado.");
            return Optional.empty();
        }

        Usuario usuario = usuarioOpt.get();
        String passwordBD = usuario.getContrasena();

        // Comparación literal
        if (rawPassword.trim().equals(passwordBD.trim())) {
            return Optional.of(usuario);
        }

        System.out.println("Login fallido: Contraseña incorrecta para el usuario " + rutLimpio);
        return Optional.empty();
    }

    public UserInfoDTO toUserInfoDTO(Usuario usuario) {
        return new UserInfoDTO(
                usuario.getIdUsuario(),
                usuario.getRut(),
                usuario.getRol(),
                usuario.getCorreo(),
                usuario.getNombre()
        );
    }

    // Obtiene usuarios de un rol específico de forma paginada
    public UsuariosPaginadosResponse obtenerUsuariosPorRolPaginados(String rol, int page, int size) {
        // Validar parámetros de paginación
        if (page < 0 || size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parámetros de paginación inválidos");
        }

        long totalElements = usuarioRepository.contarUsuariosPorRol(rol);
        int totalPages = (int) Math.ceil((double) totalElements / size);

        // Validar que la página no exceda el total
        if (page >= totalPages && totalElements > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La página solicitada supera el total de páginas disponibles");
        }

        List<Usuario> usuarios = usuarioRepository.obtenerUsuariosPorRolPaginado(rol, page, size);
        List<UserInfoDTO> usuariosDTO = usuarios.stream()
                .map(this::toUserInfoDTO)
                .toList();

        return new UsuariosPaginadosResponse(usuariosDTO, page, size, totalElements, totalPages);
    }
}