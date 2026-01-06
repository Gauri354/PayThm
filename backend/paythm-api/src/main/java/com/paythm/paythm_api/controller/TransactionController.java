package com.paythm.paythm_api.controller;

import com.paythm.paythm_api.entity.Transaction;
import com.paythm.paythm_api.service.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public Transaction add(@RequestBody Transaction t) {
        return service.add(t);
    }

    @GetMapping("/{userId}")
    public List<Transaction> getByUser(@PathVariable Long userId) {
        return service.getUserTransactions(userId);
    }
}
