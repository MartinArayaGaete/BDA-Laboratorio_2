package com.example.demo.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public UserDetails loadUserByUsername(String rut) throws UsernameNotFoundException {
        String sql = "SELECT rut, contrasena, rol FROM usuario WHERE rut = ?";

        return jdbcTemplate.query(sql, rs -> {
            if (rs.next()) {
                return new User(
                        rs.getString("rut"),
                        rs.getString("contrasena"),
                        AuthorityUtils.createAuthorityList("ROLE_" + rs.getString("rol"))
                );
            }
            throw new UsernameNotFoundException("Usuario no encontrado");
        }, rut);
    }
}