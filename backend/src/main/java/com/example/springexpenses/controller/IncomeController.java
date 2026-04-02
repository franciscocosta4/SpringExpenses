package com.example.springexpenses.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

        return incomeService.getUserIncomesList(user.getId());
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

    /**
     * Atualizar income
     */
    @PutMapping("/{id}") // Mapeia HTTP PUT para atualizar um recurso existente.
    public Income updateIncome(@PathVariable Long id, Authentication authentication, @RequestBody Income income) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        return incomeService.updateIncome(user.getId(), id, income);
    }

    /**
     * Apagar income
     */

    // DELETE: DELETE /incomes/{id}
    @DeleteMapping("/{id}") // Mapeia HTTP DELETE para apagar um recurso.
    public boolean deleteIncome(@PathVariable Long id, Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        return incomeService.deleteIncome(user.getId(), id);
    }
}