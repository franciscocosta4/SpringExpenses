package com.example.springexpenses.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {

    public String description;
    public BigDecimal amount;
    public LocalDate date;

    // aqui vem o ID da categoria, não o objeto
    public Long categoryId;
}

