package com.example.springexpenses.service;

import com.example.springexpenses.repository.CategoryRepository;
import com.example.springexpenses.model.Category;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getUserCategorys(Long userId){
        return categoryRepository.findByUserId(userId);
    }
}
