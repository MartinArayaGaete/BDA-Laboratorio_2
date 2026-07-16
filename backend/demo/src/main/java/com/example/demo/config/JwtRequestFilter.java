package com.example.demo.config;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtRequestFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;
        String rut = null;
        String rol = null;

        // 1. Intentar obtener el token de las Cookies
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token_acceso".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // 2. Si no hay cookie, buscar en el Header Authorization (útil para Postman)
        if (token == null) {
            String authorizationHeader = request.getHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
            }
        }

        // 3. Procesar el token solo si existe
        if (token != null) {
            try {
                rut = jwtUtils.extractRut(token);
                rol = jwtUtils.extractClaim(token, claims -> claims.get("rol", String.class));

                // Si tenemos RUT y no hay una autenticación previa en el contexto
                if (rut != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(rut);

                    if (jwtUtils.validateToken(token)) {
                        // Importante: Asegurar el prefijo ROLE_ para que coincida con hasRole en SecurityConfig
                        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + rol);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, List.of(authority));

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // Establecemos la identidad en el contexto de seguridad
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (ExpiredJwtException e) {
                // LOG: El token expiró, pero no bloqueamos la cadena.
                // Spring Security decidirá si el acceso es denegado basándose en SecurityConfig.
                logger.warn("JWT detectado pero está expirado.");
            } catch (Exception e) {
                // LOG: Error de parseo o token malformado.
                logger.error("Error al procesar el token JWT.");
            }
        }

        // 4. CONTINUAR SIEMPRE: Esto permite que el login (permitido para todos) funcione
        // incluso si el cliente envió un token inválido de una sesión anterior.
        filterChain.doFilter(request, response);
    }
}