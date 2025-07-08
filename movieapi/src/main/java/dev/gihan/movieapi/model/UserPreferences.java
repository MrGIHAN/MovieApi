package dev.gihan.movieapi.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
public class UserPreferences {

    @Id
    private Long id;
    private String theme; // "light" or "dark"
    private List<String> favoriteGenres;
    private String language;


}
