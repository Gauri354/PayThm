package com.paythm.paythm_api.service;

import com.paythm.paythm_api.dto.InsightsResponse;
import com.paythm.paythm_api.entity.BillSplit;
import com.paythm.paythm_api.entity.Budget;
import com.paythm.paythm_api.entity.Goal;
import com.paythm.paythm_api.entity.Transaction;
import com.paythm.paythm_api.entity.Wallet;
import com.paythm.paythm_api.repository.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InsightsService {

    private final TransactionRepository transactionRepository;
    private final GoalRepository goalRepository;
    private final BudgetRepository budgetRepository;
    private final BillSplitRepository billSplitRepository;
    private final WalletRepository walletRepository;

    public InsightsService(TransactionRepository transactionRepository,
            GoalRepository goalRepository,
            BudgetRepository budgetRepository,
            BillSplitRepository billSplitRepository,
            WalletRepository walletRepository) {
        this.transactionRepository = transactionRepository;
        this.goalRepository = goalRepository;
        this.budgetRepository = budgetRepository;
        this.billSplitRepository = billSplitRepository;
        this.walletRepository = walletRepository;
    }

    public InsightsResponse generateInsights(Long userId) {
        InsightsResponse response = new InsightsResponse();

        // 1. Basic Stats (Wallet / Transactions)
        Double totalSpent = transactionRepository.calculateTotalSpent(userId);
        Double totalReceived = transactionRepository.calculateTotalReceived(userId);

        response.setTotalSpent(totalSpent != null ? totalSpent : 0.0);
        response.setTotalReceived(totalReceived != null ? totalReceived : 0.0);

        List<String> suggestions = new ArrayList<>();
        Optional<Wallet> walletOpt = walletRepository.findByUserId(userId);
        double balance = walletOpt.map(Wallet::getBalance).orElse(0.0);

        // --- WALLET INSIGHTS ---
        if (balance < 500) {
            suggestions.add("Your wallet balance is low (₹" + balance + "). Consider adding funds for emergencies.");
        } else if (balance > 50000) {
            suggestions.add("Healthy balance! Consider investing or adding to a Savings Goal.");
        }

        // --- SPENDING INSIGHTS ---
        List<Transaction> recentTransactions = transactionRepository.findByUserId(userId);
        if (recentTransactions.isEmpty()) {
            suggestions.add("Start using your wallet to unlock AI Spending Insights!");
        } else {
            long debitCount = recentTransactions.stream().filter(t -> "DEBIT".equals(t.getType())).count();
            if (debitCount > 10) {
                suggestions.add("High Activity: You've made " + debitCount + " transactions recently.");
            }

            // Late night check
            boolean lateNight = recentTransactions.stream()
                    .anyMatch(t -> t.getTimestamp() != null
                            && (t.getTimestamp().getHour() > 23 || t.getTimestamp().getHour() < 5));
            if (lateNight) {
                suggestions
                        .add("Late Night Owl: We noticed late-night transactions. Keep an eye on impulsive spending!");
            }
        }

        // --- GOAL INSIGHTS ---
        List<Goal> goals = goalRepository.findByUserId(userId);
        if (goals.isEmpty()) {
            suggestions.add("You have no active Savings Goals. Create one to save for your dreams!");
        } else {
            for (Goal goal : goals) {
                double percentage = (goal.getCurrentAmount() / goal.getTargetAmount()) * 100;
                if (percentage >= 100) {
                    suggestions.add("Congratulations! You've achieved your goal: " + goal.getName() + " 🎉");
                } else if (percentage > 80) {
                    suggestions.add("Almost there! You are " + (int) percentage + "% towards " + goal.getName() + ".");
                } else if (goal.getCurrentAmount() == 0) {
                    suggestions.add("Start saving for " + goal.getName() + ". Even small amounts help!");
                }
            }
            // Generic savings advice if multiple goals exist
            if (goals.size() > 2) {
                suggestions.add("You are juggling multiple financial goals. Great discipline!");
            }
        }

        // --- BUDGET INSIGHTS ---
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        if (budgets.isEmpty()) {
            suggestions.add("No budgets set. Use the Budget Planner to track expenses better.");
        } else {
            for (Budget budget : budgets) {
                if (budget.getSpentAmount() > budget.getLimitAmount()) {
                    suggestions.add("🚨 Alert: You have exceeded your budget for " + budget.getCategory() + "!");
                } else if (budget.getSpentAmount() > 0.85 * budget.getLimitAmount()) {
                    suggestions.add("⚠️ Warning: You used over 85% of your " + budget.getCategory() + " budget.");
                }
            }
        }

        // --- SPLIT BILL INSIGHTS ---
        List<BillSplit> bills = billSplitRepository.findByUserId(userId);
        long pendingBills = bills.stream()
                .filter(b -> "OPEN".equalsIgnoreCase(b.getStatus()) || "PENDING".equalsIgnoreCase(b.getStatus()))
                .count();
        if (pendingBills > 0) {
            suggestions
                    .add("You have " + pendingBills + " active split bills. Check if friends have settled their dues.");
        }

        // Finalize Response
        response.setTopSpendingCategory("General"); // Placeholder
        response.setAiSuggestions(suggestions);

        return response;
    }
}
