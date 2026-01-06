package com.paythm.paythm_api.controller;

import com.paythm.paythm_api.dto.InsightsResponse;
import com.paythm.paythm_api.service.InsightsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insights")
@CrossOrigin(origins = "*") // Allow frontend access
public class InsightsController {

    @Autowired
    private InsightsService insightsService;

    @GetMapping("/{userId}")
    public InsightsResponse getInsights(@PathVariable Long userId) {
        return insightsService.generateInsights(userId);
    }
}
