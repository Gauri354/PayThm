package com.paythm.paythm_api.controller;

import com.paythm.paythm_api.entity.Goal;
import com.paythm.paythm_api.service.GoalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class GoalController {

    private final GoalService service;

    public GoalController(GoalService service) {
        this.service = service;
    }

    @PostMapping
    public Goal addGoal(@RequestBody Goal goal, @RequestParam Long userId) {
        return service.addGoal(goal, userId);
    }

    @GetMapping
    public List<Goal> getGoals(@RequestParam Long userId) {
        return service.getGoals(userId);
    }

    @PostMapping("/{goalId}/add-money/{amount}")
    public org.springframework.http.ResponseEntity<Goal> addMoney(@PathVariable Long goalId,
            @PathVariable double amount) {
        try {
            return org.springframework.http.ResponseEntity.ok(service.addMoneyToGoal(goalId, amount));
        } catch (RuntimeException e) {
            return org.springframework.http.ResponseEntity.badRequest().build();
        }
    }
}
