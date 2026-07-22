package com.example.demo.services;

import com.example.demo.dtos.FlechaArqueroDTO;
import com.example.demo.dtos.LeaderboardDTO;
import com.example.demo.dtos.PuntajeRondaDTO;
import com.example.demo.repositories.FlechaRepository;
import com.example.demo.repositories.ParticipacionRepository;
import com.example.demo.repositories.RondaRepository;
import org.springframework.dao.DataAccessException;
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

    @Transactional
    public void registrarRondaCompletaDTO(PuntajeRondaDTO request) {
        if (request.getFlechas() != null && !request.getFlechas().isEmpty()) {
            for (Integer puntaje : request.getFlechas()) {
                if (puntaje == null || puntaje < 0 || puntaje > 10) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Puntaje inválido");
                }
            }
        }

        try {
            flechaRepository.guardarRondaCompletaSP(
                    request.getIdRonda(),
                    request.getIdParticipacion(),
                    request.getFlechas(),
                    request.getIdAdmin(),
                    request.getPosicionArquero(),
                    request.getPosicionDiana()
            );
        } catch (DataAccessException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    extraerMensajeBaseDatos(exception),
                    exception
            );
        }

        registrarLogSistema(request);
    }

    private String extraerMensajeBaseDatos(Throwable exception) {
        Throwable current = exception;

        while (current != null) {
            String message = limpiarMensajePostgres(current.getMessage());
            if (message != null) return message;
            current = current.getCause();
        }

        return "No se pudo registrar la ronda por una validación de la base de datos.";
    }

    private String limpiarMensajePostgres(String message) {
        if (message == null || message.isBlank()) return null;

        int errorIndex = message.indexOf("ERROR:");
        if (errorIndex < 0) return null;

        String postgresMessage = message.substring(errorIndex + "ERROR:".length()).trim();
        int lineBreak = postgresMessage.indexOf('\n');
        if (lineBreak >= 0) {
            postgresMessage = postgresMessage.substring(0, lineBreak).trim();
        }

        return postgresMessage.isBlank() ? null : postgresMessage;
    }

    private void registrarLogSistema(PuntajeRondaDTO request) {
        String info = request.getFlechas() != null && !request.getFlechas().isEmpty()
                ? "registró puntajes"
                : "posicionó arquero y diana";
        System.out.println("Log: El admin " + request.getIdAdmin() + " " + info + ".");
    }

    public List<LeaderboardDTO> obtenerLeaderboard() {
        return flechaRepository.obtenerLeaderboardHistorico();
    }

    public List<LeaderboardDTO> obtenerMejoresDelMes() {
        return flechaRepository.obtenerMejoresArquerosUltimoMes();
    }
}
