package com.paythm.paythm_api.service;

import com.paythm.paythm_api.dto.UserLoginRequest;
import com.paythm.paythm_api.entity.User;
import com.paythm.paythm_api.entity.Wallet;
import com.paythm.paythm_api.repository.UserRepository;
import com.paythm.paythm_api.repository.WalletRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repo;
    private final WalletRepository walletRepo;
    private final com.paythm.paythm_api.repository.TransactionRepository txRepo;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository repo, WalletRepository walletRepo,
            com.paythm.paythm_api.repository.TransactionRepository txRepo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // ✔ SIGNUP
    @org.springframework.transaction.annotation.Transactional
    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Encode PIN if present - SECURE IMPL
        if (user.getPin() != null && !user.getPin().isEmpty()) {
            user.setPin(passwordEncoder.encode(user.getPin()));
        }

        // Generate PayThm ID: phone@bankname (Unique & Standard)
        if (user.getPhone() != null && !user.getPhone().isEmpty() && user.getBankName() != null) {
            String uniqueId = user.getPhone();
            String bankSuffix = user.getBankName().toLowerCase().replaceAll("\\s+", "");

            // Handle common banks for nicer IDs
            if (bankSuffix.contains("statebank"))
                bankSuffix = "sbi";
            else if (bankSuffix.contains("hdfc"))
                bankSuffix = "hdfc";
            else if (bankSuffix.contains("icici"))
                bankSuffix = "icici";
            else if (bankSuffix.contains("axis"))
                bankSuffix = "axis";
            else if (bankSuffix.contains("kotak"))
                bankSuffix = "kotak";
            else if (bankSuffix.contains("punjab"))
                bankSuffix = "pnb";
            else if (bankSuffix.contains("baroda"))
                bankSuffix = "bob";
            else if (bankSuffix.contains("maharashtra"))
                bankSuffix = "bom";
            else if (bankSuffix.contains("union"))
                bankSuffix = "union";
            else if (bankSuffix.contains("central"))
                bankSuffix = "cbi";
            else if (bankSuffix.contains("indus"))
                bankSuffix = "indus";
            else if (bankSuffix.contains("idbi"))
                bankSuffix = "idbi";
            else if (bankSuffix.contains("saraswat"))
                bankSuffix = "saraswat";
            else if (bankSuffix.contains("cosmos"))
                bankSuffix = "cosmos";
            else if (bankSuffix.contains("svc"))
                bankSuffix = "svc";
            else if (bankSuffix.contains("federal"))
                bankSuffix = "federal";
            else if (bankSuffix.contains("idfc"))
                bankSuffix = "idfc";
            else if (bankSuffix.contains("yes"))
                bankSuffix = "yes";

            user.setPaythmId(uniqueId + "@" + bankSuffix);
        } else {
            // Fallback unique ID
            String prefix = (user.getEmail() != null) ? user.getEmail().split("@")[0] : "user";
            user.setPaythmId(prefix + System.currentTimeMillis() + "@paythm");
        }

        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setKycStatus("PENDING");
        user.setRole("USER");

        User savedUser = repo.save(user);

        // Auto create wallet
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(0.0);
        walletRepo.save(wallet);

        return savedUser;
    }

    // ✔ LOGIN (correct version)
    public User login(UserLoginRequest request) {
        List<User> users = repo.findByEmail(request.getEmail());
        User user = users.isEmpty() ? null : users.get(0);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    public List<User> getAll() {
        return repo.findAll();
    }

    // ✔ For /signup
    public User createUser(User user) {
        return register(user);
    }

    // ✔ Update KYC Status
    public User updateKycStatus(Long userId, String status) {
        User user = repo.findById(userId).orElse(null);
        if (user != null) {
            user.setKycStatus(status);
            return repo.save(user);
        }
        return null;
    }

    // Verify PIN - SECURE IMPL
    public boolean verifyPin(Long userId, String pin) {
        User user = repo.findById(userId).orElse(null);
        if (user != null && user.getPin() != null) {
            // Use passwordEncoder to match the hashed PIN
            return passwordEncoder.matches(pin, user.getPin());
        }
        return false;
    }

    // ✔ Delete User (Cascade)
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long userId) {
        User user = repo.findById(userId).orElse(null);
        if (user != null) {
            // 1. Delete Wallet & Transactions
            Wallet wallet = walletRepo.findByUser(user);
            if (wallet != null) {
                List<com.paythm.paythm_api.entity.Transaction> txs = txRepo.findByWallet(wallet);
                txRepo.deleteAll(txs);
                walletRepo.delete(wallet);
            }
            // 2. Delete User
            repo.delete(user);
        }
    }
}
