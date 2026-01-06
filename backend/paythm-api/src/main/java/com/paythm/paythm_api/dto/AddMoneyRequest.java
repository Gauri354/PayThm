package com.paythm.paythm_api.dto;

import lombok.Data;

@Data
public class AddMoneyRequest {
    private Long userId;
    private double amount;
}
