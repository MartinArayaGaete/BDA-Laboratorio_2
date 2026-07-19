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

    @Transactional
    public void registrarRondaCompletaDTO(PuntajeRondaDTO request) {
        for (Integer puntaje : request.getFlechas()) {
            if (puntaje < 0 || puntaje > 10) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Puntaje inválido");
            }
        }

        flechaRepository.guardarRondaCompletaSP(
                request.getIdRonda(),
                request.getIdParticipacion(),
                request.getFlechas(),
                request.getIdAdmin(),
                request.getPosicionArquero(),
                request.getPosicionDiana()
        );

        registrarLogSistema(request);
    }

    private void registrarLogSistema(PuntajeRondaDTO request) {
        System.out.println("Log: El admin " + request.getIdAdmin() + " registró puntajes.");
    }

    public List<LeaderboardDTO> obtenerLeaderboard() {
        return flechaRepository.obtenerLeaderboardHistorico();
    }

    public List<LeaderboardDTO> obtenerMejoresDelMes() {
        return flechaRepository.obtenerMejoresArquerosUltimoMes();
    }
}