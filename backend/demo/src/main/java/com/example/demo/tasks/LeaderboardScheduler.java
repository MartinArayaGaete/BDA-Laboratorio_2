package com.example.demo.tasks; 

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LeaderboardScheduler {

    private final JdbcTemplate jdbcTemplate;

    public LeaderboardScheduler(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    //Cada minuto al segundo 30 -> @Scheduled(cron = "30 * * * * *", zone = "America/Santiago")
    @Scheduled(cron = "0 0 2 * * *", zone = "America/Santiago")
    public void refreshLeaderboard() {
        jdbcTemplate.execute("REFRESH MATERIALIZED VIEW leaderboard_top_50");
    }
}