
package com.paythm.paythm_api.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    private String email;
    private String phone;

    @Column(name = "password_hash")
    private String password;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "kyc_status")
    private String kycStatus;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "paythm_id", unique = true)
    private String paythmId;

    @Column(name = "pin")
    private String pin;

    private String role;
}
