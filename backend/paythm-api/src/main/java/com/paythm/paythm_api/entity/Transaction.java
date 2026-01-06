package com.paythm.paythm_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double amount;

    private String type; // "CREDIT" | "DEBIT"
    private String message; // must exist for setMessage calls
    private String status = "Completed"; // Default to Completed
    private java.time.LocalDateTime timestamp = java.time.LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
}
