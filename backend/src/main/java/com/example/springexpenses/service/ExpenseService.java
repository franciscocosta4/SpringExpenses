package com.example.springexpenses.service;

import com.example.springexpenses.repository.ExpenseRepository;
import com.example.springexpenses.repository.CategoryRepository;
import com.example.springexpenses.repository.UserRepository;
import com.example.springexpenses.model.Expense;
import com.example.springexpenses.dto.ExpenseRequest;
import com.example.springexpenses.model.Category;
import com.example.springexpenses.model.Income;
import com.example.springexpenses.model.User;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Buscar expenses do user
     */
    public List<Expense> getUserExpensesList(Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    public BigDecimal getUserTotalExpense(String email) {
        // Vai buscar a soma diretamente à base de dados
        BigDecimal total = expenseRepository.sumTotalByUserEmail(email);

        // IMPORTANTE:
        // Se não existirem registos, a BD devolve null
        // garantimos que nunca devolvemos null ao resto da app
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Criar expense associado ao user autenticado
     */
    public Expense createExpense(Long userId, ExpenseRequest dto) {
        Category category = null;

        if (dto.categoryId != null) {
            category = categoryRepository.findById(dto.categoryId)
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        }
        // buscar user na BD
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense();

        expense.setDescription(dto.description);
        expense.setAmount(dto.amount);
        expense.setDate(dto.date);
        expense.setCategory(category);
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    /**
     * Atualiza uma Expense garantindo que pertence ao utilizador autenticado.
     */
    public Expense updateExpense(Long userId, Long ExpenseId, Expense updatedExpenseData) {

        // 1. Buscar o income pelo id e pelo userId (validação já no query)
        Optional<Expense> optionalExpense = expenseRepository.findByIdAndUserId(ExpenseId, userId);

        // 2. Se não existir, lançar erro
        Expense existingExpense = optionalExpense
                .orElseThrow(() -> new RuntimeException("Income not found or not authorized"));

        // 3. Atualizar apenas os campos permitidos
        existingExpense.setAmount(updatedExpenseData.getAmount());
        existingExpense.setDate(updatedExpenseData.getDate());
        existingExpense.setDescription(updatedExpenseData.getDescription());
        existingExpense.setCategory(updatedExpenseData.getCategory());

        // 4. Guardar e retornar
        return expenseRepository.save(existingExpense);
    }

    /**
     * apaga um Income que pertence ao utilizador autenticado.
     */
    public boolean deleteExpense(Long userId, Long expenseId) {

        // 1. Buscar o income pelo id e pelo userId (validação já no query)
        Optional<Expense> optionalExpense = expenseRepository.findByIdAndUserId(expenseId, userId);

        if (optionalExpense.isPresent()) {
            expenseRepository.delete(optionalExpense.get());
            return true;
        } else {
            return false;
        }
    }
}
