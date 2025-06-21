package com.kenn.social_network.repository;

import com.kenn.social_network.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    @Query("""
            SELECT u FROM User u
            WHERE u.firstName LIKE :search
            OR u.lastName LIKE :search
            OR u.address LIKE :search
            OR u.email LIKE :search
            OR u.role.name LIKE :search
            """)
    Page<User> findAll(String search, Pageable pageable);

    Optional<User> findByEmailAndRefreshToken(String email, String refreshToken);

    List<User> findByIdIn(List<Long> ids);
}
