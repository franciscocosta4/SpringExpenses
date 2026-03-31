package com.example.springexpenses.service;

import com.example.springexpenses.repository.IncomeRepository;
import com.example.springexpenses.repository.UserRepository;
import com.example.springexpenses.model.Income;
import com.example.springexpenses.model.User;

import java.util.List;

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
}
