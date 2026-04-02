package com.example.springexpenses.dto;

import java.math.BigDecimal;
//? USAMOS DTO  POIS QUEREMOS ORGANIZAR OS DADOS QUE VÃO PARA A DASHBOARD, MESMO ESTES NÃO PERTENCENDO A NENHUMA TABELA


public class DashboardDTO {

    // Representa o total de receitas (income)
    private BigDecimal totalIncome;

    // Representa o total de despesas (expenses)
    private BigDecimal totalExpenses;

    // Representa o saldo final (income - expenses)
    private BigDecimal balance;

    // Getter para totalIncome
    public BigDecimal getTotalIncome() {
        return totalIncome; // retorna o valor atual de totalIncome
    }

    // Setter para totalIncome
    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome; // define um novo valor para totalIncome
    }

    // Getter para totalExpenses
    public BigDecimal getTotalExpenses() {
        return totalExpenses; // retorna o valor atual de totalExpenses
    }

    // Setter para totalExpenses
    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses; // define um novo valor para totalExpenses
    }

    // Getter para balance
    public BigDecimal getBalance() {
        return balance; // retorna o valor atual do saldo
    }

    // Setter para balance
    public void setBalance(BigDecimal balance) {
        this.balance = balance; // define um novo valor para o saldo
    }
}