package dev.gihan.movieapi.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "watch_history")
public class WatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @Column(name = "watch_position_seconds")
    private Integer watchPositionSeconds; 

    @Column(name = "completed")
    private Boolean completed;

    @Column(name = "watched_at")
    private LocalDateTime watchedAt;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

}
