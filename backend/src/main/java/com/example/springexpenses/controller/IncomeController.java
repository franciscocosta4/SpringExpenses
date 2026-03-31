package com.example.springexpenses.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springexpenses.model.Income;
import com.example.springexpenses.model.User;
import com.example.springexpenses.service.IncomeService;
import com.example.springexpenses.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/incomes")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Buscar incomes do utilizador autenticado
     */
    @GetMapping
    public List<Income> getUserIncomes(Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        return incomeService.getAllUserIncomes(user.getId());
    }

    /**
     * Criar income
     */
    @PostMapping
    public Income createIncome(@RequestBody Income income,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        return incomeService.createIncome(user.getId(), income);
    }
}