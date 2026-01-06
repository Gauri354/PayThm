package com.paythm.paythm_api.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "bank_accounts")
public class BankAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "bank_name")
    private String bankName; // e.g., "State Bank of India"

    @Column(name = "account_number")
    private String accountNumber; // e.g., "**** 4532"

    @Column(name = "balance")
    private double balance;

    @Column(name = "is_primary")
    private boolean isPrimary;
}
