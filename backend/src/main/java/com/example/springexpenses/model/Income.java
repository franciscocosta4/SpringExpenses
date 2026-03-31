package com.example.springexpenses.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;

@Entity
//liga a entidade a um “listener” que reage a eventos do ciclo de vida da entidade
@EntityListeners(AuditingEntityListener.class) // ou seja, vai preencher o created_at
@Table(name = "income")
public class Income {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal  amount;   

    @Column(nullable = false, updatable = false)
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, updatable = false, name = "created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    // getters / setters normais
    public void setUser(User user) {
    this.user = user;
}
    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal a) {
        this.amount = a;
    }

    public LocalDateTime getDate() {
        return date;
    }
    public void setDate( LocalDateTime date) {
        this.date = date;
    }
    
    public LocalDateTime getcreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


}
