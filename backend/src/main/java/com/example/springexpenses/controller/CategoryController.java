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

import com.example.springexpenses.model.Category;
import com.example.springexpenses.model.Income;
import com.example.springexpenses.model.User;
import com.example.springexpenses.service.CategoryService;
import com.example.springexpenses.repository.UserRepository;

import java.util.List;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService; 

    @Autowired
    private UserRepository userRepository;
    /**
     * Mostrar categorias do user (por enquanto ainda só é util para os forms )
     */
    @GetMapping
    public List<Category> getUserCategorys(Authentication authentication) {
        String email =  authentication.getName();
        User user = userRepository.findByEmail(email);
        return categoryService.getUserCategorys(user.getId());
    }

    @PostMapping
    public Category createCategory(Authentication authentication, @RequestBody Category category) {
        String email =  authentication.getName();
        User user = userRepository.findByEmail(email);
        return categoryService.createCategory(user.getId(), category);
    }

    @PutMapping("/{id}") // Mapeia HTTP PUT para atualizar um recurso existente.
    public Category updateCategory(@PathVariable Long id, Authentication authentication, @RequestBody Category category) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        return categoryService.updateCategory(user.getId(), id, category);
    }
    

    @DeleteMapping("/{id}") // Mapeia HTTP DELETE para apagar um recurso.
    public boolean deleteCategory(@PathVariable Long id, Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email);

        return categoryService.deleteCategory(user.getId(), id);
    }

    
}
