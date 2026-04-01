package com.example.springexpenses.repository;
import com.example.springexpenses.model.Income;
import org.springframework.data.jpa.repository.JpaRepository; // Interface base do Spring Data JPA.
import org.springframework.stereotype.Repository; // Anotação semântica (não obrigatória mas recomendada).
import java.util.List;
import java.util.Optional;


@Repository// Marca esta interface como componente de repositório do Spring.
public interface IncomeRepository extends JpaRepository<Income, Long> {
    /**
     * Spring Data JPA cria automaticamente a query:
     * SELECT * FROM income WHERE user_id = ?
     */
    List<Income> findByUserId(Long userId);

        /**
     * Busca um Income pelo id garantindo que pertence ao user.
     */
    Optional<Income> findByIdAndUserId(Long id, Long userId);
}