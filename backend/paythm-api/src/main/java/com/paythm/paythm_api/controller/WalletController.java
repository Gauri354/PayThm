package com.paythm.paythm_api.controller;

import com.paythm.paythm_api.service.WalletService;
import com.paythm.paythm_api.dto.SendUpiRequest;
import com.paythm.paythm_api.dto.SendBankRequest;
import com.paythm.paythm_api.entity.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping("/balance/{userId}")
    public double getBalance(@PathVariable Long userId) {
        return walletService.getBalance(userId);
    }

    @PostMapping("/add/{userId}/{amount}")
    public ResponseEntity<String> addMoney(@PathVariable Long userId, @PathVariable double amount) {
        try {
            walletService.addMoney(userId, amount);
            return ResponseEntity.ok("Money Added!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/add")
    public String addMoneyWithBody(@RequestBody com.paythm.paythm_api.dto.AddMoneyRequest request) {
        walletService.addMoney(request.getUserId(), request.getAmount());
        return "Money Added Successfully!";
    }

    @PostMapping("/send/{sender}/{receiver}/{amount}")
    public ResponseEntity<String> sendMoney(@PathVariable Long sender,
            @PathVariable String receiver,
            @PathVariable double amount) {
        String result = walletService.sendMoney(sender, receiver, amount);
        if ("Money Sent Successfully!".equals(result)) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/send-upi")
    public ResponseEntity<String> sendUpi(@RequestBody SendUpiRequest request) {
        String result = walletService.sendMoneyViaUpi(request.getSenderId(), request.getUpiId(), request.getAmount());
        if ("UPI Transfer Successful".equals(result)) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/send-bank")
    public ResponseEntity<String> sendBank(@RequestBody SendBankRequest request) {
        String result = walletService.sendMoneyViaBank(
                request.getSenderId(),
                request.getAccountNumber(),
                request.getIfsc(),
                request.getRecipientName(),
                request.getAmount());
        if ("Bank Transfer Successful".equals(result)) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @GetMapping("/history/{userId}")
    public List<Transaction> history(@PathVariable Long userId) {
        return walletService.history(userId);
    }

    @GetMapping("/bank-details/{userId}")
    public com.paythm.paythm_api.entity.BankAccount getBankDetails(@PathVariable Long userId) {
        return walletService.getBankDetails(userId);
    }

    @GetMapping("/all-transactions")
    public List<Transaction> getAllTransactions() {
        return walletService.getAllTransactions();
    }
}
