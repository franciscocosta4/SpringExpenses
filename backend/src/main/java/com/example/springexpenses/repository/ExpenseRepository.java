package com.example.springexpenses.repository;

import com.example.springexpenses.model.Expense;

import org.springframework.data.jpa.repository.JpaRepository; // Interface base do Spring Data JPA.
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository; // Anotação semântica (não obrigatória mas recomendada).

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


@Repository // Marca esta interface como componente de repositório do Spring.
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    /**
     * Spring Data JPA cria automaticamente a query:
     * SELECT * FROM expense WHERE user_id = ?
     */
    List<Expense> findByUserId(Long userId);

    /**
     * Busca uma Expense pelo id garantindo que pertence ao user.
     */
    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    // Importante: usar JPQL para somar diretamente na base de dados
    @Query("SELECT SUM(i.amount) FROM Expense i WHERE i.user.email = :email")
    BigDecimal sumTotalByUserEmail(@Param("email") String email);
}
