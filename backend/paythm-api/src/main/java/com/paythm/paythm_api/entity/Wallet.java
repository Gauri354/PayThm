package com.paythm.paythm_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // using double for simplicity — you can switch to BigDecimal later
    private double balance;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}
