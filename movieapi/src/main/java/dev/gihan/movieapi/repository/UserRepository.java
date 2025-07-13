package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByRole(String role);

    boolean existsByEmail(String email);

    boolean existsByRole(String role);
}
