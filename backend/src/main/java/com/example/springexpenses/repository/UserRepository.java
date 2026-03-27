package com.example.springexpenses.repository;
import com.example.springexpenses.model.User;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository; // Interface base do Spring Data JPA.


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
     //necessário para login com email
    User findByEmail(String email);
}