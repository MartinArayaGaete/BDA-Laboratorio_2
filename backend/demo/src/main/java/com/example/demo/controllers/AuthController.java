package com.example.demo.controllers;

import com.example.demo.config.JwtUtils;
import com.example.demo.dtos.UserInfoDTO;
import jakarta.servlet.http.HttpServletRequest;
import com.example.demo.dtos.ValidarLoginDTO;
import com.example.demo.models.Usuario;
import com.example.demo.services.UsuarioService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtUtils jwtUtils;

    public AuthController(UsuarioService usuarioService, JwtUtils jwtUtils) {
        this.usuarioService = usuarioService;
        this.jwtUtils = jwtUtils;
    }

    // Valida las credenciales del usuario para generar un token JWT de acceso.
    // Configura una cookie HttpOnly segura con el token y retorna la información pública del perfil.
    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody ValidarLoginDTO credenciales, HttpServletResponse response) {
        try {
            Optional<Usuario> usuarioOpt = usuarioService.validarLogin(credenciales.getRut(), credenciales.getPassword());

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                String token = jwtUtils.generateToken(usuario.getRut(), usuario.getRol());

                Cookie jwtCookie = new Cookie("token_acceso", token);
                jwtCookie.setHttpOnly(true);
                jwtCookie.setSecure(false);
                jwtCookie.setPath("/");
                jwtCookie.setMaxAge(60 * 60);

                response.addCookie(jwtCookie);

                UserInfoDTO userInfo = usuarioService.toUserInfoDTO(usuario);
                return ResponseEntity.ok(userInfo);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Finaliza la sesión del usuario invalidando la cookie de acceso actual.
    // Sobrescribe la cookie 'token_acceso' con un tiempo de vida de cero segundos para que el navegador la elimine.
    @PostMapping("/logout")
    public ResponseEntity<?> cerrarSesion(HttpServletResponse response) {
        Cookie cookie = new Cookie("token_acceso", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok("Sesión cerrada");
    }

    // Verifica la validez del token actual (vía cookie o cabecera Bearer) para renovar la sesión sin pedir credenciales.
    // Emite un nuevo token JWT actualizado y refresca la cookie de acceso en el navegador del usuario.
    @PostMapping("/refresh-token")
    public ResponseEntity<String> refreshToken(@RequestHeader(value = "Authorization", required = false) String authorizationHeader, HttpServletRequest request, HttpServletResponse response) {
        String token = null;

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token_acceso".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null && authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
        }

        if (token == null || !jwtUtils.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String rut = jwtUtils.extractRut(token);
        Optional<Usuario> usuarioOpt = usuarioService.findByRut(rut);

        if (usuarioOpt.isPresent()) {
            String nuevoToken = jwtUtils.generateToken(usuarioOpt.get().getRut(), usuarioOpt.get().getRol());

            Cookie jwtCookie = new Cookie("token_acceso", nuevoToken);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(60 * 60);
            response.addCookie(jwtCookie);

            return ResponseEntity.ok(nuevoToken);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}