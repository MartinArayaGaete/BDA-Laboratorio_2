package com.example.demo.services;

import com.example.demo.dtos.FlechaArqueroDTO;
import com.example.demo.dtos.LeaderboardDTO;
import com.example.demo.dtos.PuntajeRondaDTO;
import com.example.demo.repositories.FlechaRepository;
import com.example.demo.repositories.ParticipacionRepository;
import com.example.demo.repositories.RondaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FlechaService {

    private final ParticipacionRepository participacionRepository;
    private final RondaRepository rondaRepository;
    private final FlechaRepository flechaRepository;

    public FlechaService(FlechaRepository flechaRepository, ParticipacionRepository participacionRepository, RondaRepository rondaRepository) {
        this.flechaRepository = flechaRepository;
        this.participacionRepository = participacionRepository;
        this.rondaRepository = rondaRepository;
    }

    public List<FlechaArqueroDTO> obtenerFlechasArquero(Long idUsuario, Long idTorneo) {
        return flechaRepository.obtenerFlechasDeArqueroEnTorneo(idUsuario, idTorneo);
    }

    public List<FlechaArqueroDTO> obtenerFlechasArqueroEnRonda(Long idUsuario, Long idTorneo, Integer numeroRonda) {
        return flechaRepository.obtenerFlechasDeArqueroEnRonda(idUsuario, idTorneo, numeroRonda);
    }

    public void registrarRondaCompleta(Long idTorneo, Long idUsuario, Integer numeroRonda, List<Integer> flechas, Long idAdmin) {
        for (Integer puntaje : flechas) {
            if (puntaje < 0 || puntaje > 10) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trampa detectada: Los puntajes deben estar entre 0 y 10");
            }
        }

        Long idParticipacion = participacionRepository.obtenerIdParticipacion(idUsuario, idTorneo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El arquero no está inscrito en este torneo"));

        Long idRonda = rondaRepository.obtenerIdRonda(idTorneo, numeroRonda)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La ronda " + numeroRonda + " no existe en este torneo"));

        flechaRepository.guardarRondaCompletaSP(idRonda, idParticipacion, flechas, idAdmin);
    }

    // MÉTODO NUEVO CON DTO:
    @Transactional
    public void registrarRondaCompletaDTO(PuntajeRondaDTO request) {
        // Validaciones
        for (Integer puntaje : request.getFlechas()) {
            if (puntaje < 0 || puntaje > 10) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Puntaje inválido");
            }
        }

        flechaRepository.guardarRondaCompletaSP(
                request.getIdRonda(),           // 1. ID de la Ronda
                request.getIdParticipacion(),   // 2. ID de la Participación
                request.getFlechas(),           // 3. Arreglo de flechas
                request.getIdAdmin()            // 4. ID del Administrador (¡Este faltaba!)
        );

        registrarLogSistema(request);
    }

    private void registrarLogSistema(PuntajeRondaDTO request) {
        System.out.println("Log: El admin " + request.getIdAdmin() + " registró puntajes.");
    }

    // Método para pasar los datos al controlador
    public List<LeaderboardDTO> obtenerLeaderboard() {
        return flechaRepository.obtenerLeaderboardHistorico();
    }

    public List<LeaderboardDTO> obtenerMejoresDelMes() {
        return flechaRepository.obtenerMejoresArquerosUltimoMes();
    }
}