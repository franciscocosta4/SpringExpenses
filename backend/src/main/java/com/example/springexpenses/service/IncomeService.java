package com.example.springexpenses.service;

import com.example.springexpenses.repository.IncomeRepository;
import com.example.springexpenses.repository.UserRepository;
import com.example.springexpenses.model.Income;
import com.example.springexpenses.model.User;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Buscar incomes do user
     */
    public List<Income> getAllUserIncomes(Long userId) {
        return incomeRepository.findByUserId(userId);
    }

    /**
     * Criar income associado ao user autenticado
     */
    public Income createIncome(Long userId, Income incomeData) {

        // buscar user na BD
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // associar income ao user
        incomeData.setUser(user);

        return incomeRepository.save(incomeData);
    }

    /**
     * Atualiza um Income garantindo que pertence ao utilizador autenticado.
     */
    public Income updateIncome(Long userId, Long incomeId, Income updatedIncomeData) {

        // 1. Buscar o income pelo id e pelo userId (validação já no query)
        Optional<Income> optionalIncome = incomeRepository.findByIdAndUserId(incomeId, userId);

        // 2. Se não existir, lançar erro
        Income existingIncome = optionalIncome.orElseThrow(() ->
                new RuntimeException("Income not found or not authorized")
        );

        // 3. Atualizar apenas os campos permitidos
        existingIncome.setAmount(updatedIncomeData.getAmount());
        existingIncome.setDate(updatedIncomeData.getDate());

        // 4. Guardar e retornar
        return incomeRepository.save(existingIncome);
    }
    /**
     * apaga um Income que pertence ao utilizador autenticado.
     */
    public boolean deleteIncome(Long userId, Long incomeId) {

        // 1. Buscar o income pelo id e pelo userId (validação já no query)
        Optional<Income> optionalIncome = incomeRepository.findByIdAndUserId(incomeId, userId);

        if(optionalIncome.isPresent()){
            incomeRepository.delete(optionalIncome.get());
            return true;
        }else{
            return false; 
        }
    }   
}
