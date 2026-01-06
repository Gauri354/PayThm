package com.paythm.paythm_api.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private Double amount; // in INR
    private String currency = "INR";
    private Long userId;
}
