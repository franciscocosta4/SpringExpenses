package com.example.springexpenses.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication; // objeto do spring security 
// que permite trabalhar com o user autenticado
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springexpenses.model.Expense;
import com.example.springexpenses.dto.ExpenseRequest;
import com.example.springexpenses.model.Category;
import com.example.springexpenses.model.User;
import com.example.springexpenses.service.ExpenseService;
import com.example.springexpenses.service.CategoryService;
import com.example.springexpenses.repository.UserRepository;

import java.util.List;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService; 
    
    @Autowired
    private CategoryService categoryService; 

    @Autowired
    private UserRepository userRepository;


    @GetMapping("/categories")
    public List<Category> getUserCategorys(Authentication authentication) {
        String email =  authentication.getName();
        User user = userRepository.findByEmail(email);
        return categoryService.getUserCategorys(user.getId());
    }

    @GetMapping
    public List<Expense> getExpenses(Authentication authentication) {

        String email =  authentication.getName();
        User user = userRepository.findByEmail(email);

        return expenseService.getUserExpensesList(user.getId());
    }

    @PostMapping
    public Expense createExpense(@RequestBody ExpenseRequest dto,Authentication authentication ) {
        String email =  authentication.getName();
        User user = userRepository.findByEmail(email);

        return expenseService.createExpense(user.getId(), dto);

    }
    
    

    
}
