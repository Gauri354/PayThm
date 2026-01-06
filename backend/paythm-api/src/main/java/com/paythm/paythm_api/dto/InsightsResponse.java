package com.paythm.paythm_api.dto;

import lombok.Data;
import java.util.List;

@Data
public class InsightsResponse {
    private double totalSpent;
    private double totalReceived;
    private String topSpendingCategory; // Inferred from message for now if category missing
    private List<String> aiSuggestions; // The "AI" generated text
}
