package com.example.springexpenses.service;

import com.example.springexpenses.repository.CategoryRepository;
import com.example.springexpenses.repository.UserRepository;
import com.example.springexpenses.model.Category;
import com.example.springexpenses.model.Income;
import com.example.springexpenses.model.User;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;


    public List<Category> getUserCategorys(Long userId){
        return categoryRepository.findByUserId(userId);
    }

    public Category createCategory(Long userId, Category categoryData){

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        //associa um income a um user 
        categoryData.setUser(user);
        return categoryRepository.save(categoryData);
    }

    public Category updateCategory(Long userId, Long categoryId, Category updatedcategoryData){

        // 1. Buscar a category pelo id e pelo userId (validação já no query)
        Optional<Category> optionalCategory = categoryRepository.findByIdAndUserId(categoryId, userId);

        // 2. Se não existir, lançar erro
        Category existingCategory = optionalCategory.orElseThrow(() ->
                new RuntimeException("Income not found or not authorized")
        );

        // 3. Atualizar apenas os campos permitidos
        existingCategory.setName(updatedcategoryData.getName());

        // 4. Guardar e retornar
        return categoryRepository.save(existingCategory);
    }

    public boolean deleteCategory(Long userId, Long incomeId) {

        // 1. Buscar a categoria pelo id e pelo userId (validação já no query)
        Optional<Category> optionalCategory = categoryRepository.findByIdAndUserId(incomeId, userId);

        if(optionalCategory.isPresent()){
            categoryRepository.delete(optionalCategory.get());
            return true;
        }else{
            return false; 
        }
    }   
}
