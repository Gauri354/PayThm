package com.paythm.paythm_api.service;

import com.paythm.paythm_api.entity.Transaction;
import com.paythm.paythm_api.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repo;

    public TransactionService(TransactionRepository repo) {
        this.repo = repo;
    }

    public Transaction add(Transaction t) {
        return repo.save(t);
    }

    public List<Transaction> getUserTransactions(Long userId) {
        return repo.findByUserId(userId);
    }
}
