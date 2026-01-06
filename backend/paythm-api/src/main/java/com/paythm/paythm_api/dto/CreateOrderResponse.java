package com.paythm.paythm_api.dto;

import lombok.Data;

@Data
public class CreateOrderResponse {
    private String orderId;
    private Double amount;
    private String currency;
    private String keyId; // Send key back to frontend
}
