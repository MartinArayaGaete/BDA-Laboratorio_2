package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        //  Rutas Públicas
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()


                        //  Rutas Estrictas de Administrador
                        .requestMatchers(HttpMethod.POST, "/api/torneos").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/torneos/*/iniciar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/torneos/*/finalizar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/torneos/*/rondas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/torneos/registrar-puntaje").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/logs", "/api/logs/**").hasRole("ADMIN")

                        //  Rutas Compartidas
                        .requestMatchers(HttpMethod.POST, "/api/participaciones/inscribir").hasAnyRole("ADMIN", "ARQUERO")
                        .requestMatchers(HttpMethod.GET, "/api/torneos/leaderboard").hasAnyRole("ADMIN", "ARQUERO")
                        .requestMatchers(HttpMethod.GET, "/api/arqueros/rendimiento/ultimo-mes").hasAnyRole("ADMIN", "ARQUERO")

                        //  Todas las demás rutas (GET a historiales, torneos, etc.) requieren estar autenticado
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
        "http://localhost:*",
        "http://127.0.0.1:*",
        "http://172.*.*.*:*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}