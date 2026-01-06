package com.paythm.paythm_api.service;

import com.paythm.paythm_api.entity.Budget;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@org.springframework.stereotype.Service
public class BudgetService {

    private final com.paythm.paythm_api.repository.BudgetRepository repo;
    private final com.paythm.paythm_api.repository.UserRepository userRepo;

    public BudgetService(com.paythm.paythm_api.repository.BudgetRepository repo,
            com.paythm.paythm_api.repository.UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    public Budget addBudget(Budget budget, Long userId) {
        com.paythm.paythm_api.entity.User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        budget.setUser(user);
        return repo.save(budget);
    }

    public List<Budget> getBudgets(Long userId) {
        return repo.findByUserId(userId);
    }
}
