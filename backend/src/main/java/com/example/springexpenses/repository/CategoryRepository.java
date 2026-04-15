package com.example.springexpenses.repository;

import com.example.springexpenses.model.Category;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository; // Interface base do Spring Data JPA.
import org.springframework.stereotype.Repository; // Anotação semântica (não obrigatória mas recomendada).

@Repository // Marca esta interface como componente de repositório do Spring.
public interface CategoryRepository extends JpaRepository<Category, Long> {

        /**
     * Spring Data JPA cria automaticamente a query:
     * SELECT * FROM income WHERE user_id = ?
     */
    List<Category> findByUserId(Long userId);

     /**
     * Busca uma Categoria pelo id garantindo que pertence ao user.
     */
    Optional<Category> findByIdAndUserId(Long id, Long userId);


}
