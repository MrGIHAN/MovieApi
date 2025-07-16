package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.UserPreferences;
import dev.gihan.movieapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

    Optional<UserPreferences> findByUser(User user);

} 