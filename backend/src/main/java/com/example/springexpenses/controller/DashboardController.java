package com.example.springexpenses.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springexpenses.service.IncomeService;
import com.example.springexpenses.service.ExpenseService;
import com.example.springexpenses.dto.DashboardDTO;


@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private IncomeService incomeService;
    @Autowired
    private ExpenseService expenseService;

    /**
     * Buscar incomes do utilizador autenticado
     */
    @GetMapping
    public DashboardDTO getDashboard(Authentication authentication) {

        String email = authentication.getName();

        // dados vindos dos services
        var totalIncome = incomeService.getUserTotalIncome(email);
        var totalExpenses = expenseService.getUserTotalExpense(email);

        // cálculo no backend
        var balance = totalIncome.subtract(totalExpenses);

        // construir resposta
        DashboardDTO dto = new DashboardDTO();
        dto.setTotalIncome(totalIncome);
        dto.setTotalExpenses(totalExpenses);
        dto.setBalance(balance);

        return dto;
    }

}
