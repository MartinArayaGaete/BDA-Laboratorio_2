package com.example.demo.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuariosPaginadosResponse {
    private List<UserInfoDTO> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

}
