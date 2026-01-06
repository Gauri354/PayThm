package com.paythm.paythm_api.service;

import com.paythm.paythm_api.entity.Goal;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalService {

    private final com.paythm.paythm_api.repository.GoalRepository repo;
    private final com.paythm.paythm_api.repository.UserRepository userRepo;
    private final com.paythm.paythm_api.repository.WalletRepository walletRepo;

    public GoalService(com.paythm.paythm_api.repository.GoalRepository repo,
            com.paythm.paythm_api.repository.UserRepository userRepo,
            com.paythm.paythm_api.repository.WalletRepository walletRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.walletRepo = walletRepo;
    }

    public Goal addGoal(Goal goal, Long userId) {
        com.paythm.paythm_api.entity.User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        goal.setUser(user);
        return repo.save(goal);
    }

    public List<Goal> getGoals(Long userId) {
        return repo.findByUserId(userId);
    }

    @org.springframework.transaction.annotation.Transactional
    public Goal addMoneyToGoal(Long goalId, double amount) {
        Goal goal = repo.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        com.paythm.paythm_api.entity.User user = goal.getUser();
        com.paythm.paythm_api.entity.Wallet wallet = walletRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        // Deduct from Wallet
        wallet.setBalance(wallet.getBalance() - amount);
        walletRepo.save(wallet);

        // Add to Goal
        goal.setCurrentAmount(goal.getCurrentAmount() + amount);
        return repo.save(goal);
    }
}
