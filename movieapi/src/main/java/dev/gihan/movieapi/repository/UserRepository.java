package dev.gihan.movieapi.repository;

import dev.gihan.movieapi.model.User;
import dev.gihan.movieapi.model.option.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
    Optional<User> findByRole(Role role);
}