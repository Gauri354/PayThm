package com.paythm.paythm_api.controller;

import com.paythm.paythm_api.entity.Budget;
import com.paythm.paythm_api.service.BudgetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @PostMapping
    public Budget addBudget(@RequestBody Budget budget, @RequestParam Long userId) {
        return service.addBudget(budget, userId);
    }

    @GetMapping
    public List<Budget> getBudgets(@RequestParam Long userId) {
        return service.getBudgets(userId);
    }
}
