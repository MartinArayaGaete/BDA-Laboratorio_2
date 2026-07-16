package com.example.demo.dtos;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidarLoginDTO {
    private String rut;
    private String password; // Esta será la contraseña encriptada con AES desde el frontend
}