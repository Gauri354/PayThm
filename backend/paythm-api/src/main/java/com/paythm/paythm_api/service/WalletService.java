package com.paythm.paythm_api.service;

import com.paythm.paythm_api.entity.Transaction;
import com.paythm.paythm_api.entity.User;
import com.paythm.paythm_api.entity.Wallet;
import com.paythm.paythm_api.repository.UserRepository;
import com.paythm.paythm_api.repository.WalletRepository;
import com.paythm.paythm_api.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@org.springframework.transaction.annotation.Transactional
public class WalletService {

    @Autowired
    private com.paythm.paythm_api.repository.BankAccountRepository bankRepo;

    @Autowired
    private WalletRepository walletRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private TransactionRepository txRepo;

    // -------------------------------
    // GET BALANCE
    // -------------------------------
    public double getBalance(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null)
            return 0;
        Wallet wallet = walletRepo.findByUser(user);
        if (wallet == null)
            return 0;
        return wallet.getBalance();
    }

    // -------------------------------
    // ADD MONEY (Now Deducts from Mock Bank)
    // -------------------------------
    public Wallet addMoney(Long userId, double amount) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null)
            throw new RuntimeException("User not found");

        // 1. Mock Bank Logic
        List<com.paythm.paythm_api.entity.BankAccount> banks = bankRepo.findByUserAndIsPrimaryTrue(user);
        com.paythm.paythm_api.entity.BankAccount bank = banks.isEmpty() ? null : banks.get(0);

        // Auto-create mock bank if missing (Demo feature)
        if (bank == null) {
            bank = new com.paythm.paythm_api.entity.BankAccount();
            bank.setUser(user);
            bank.setBankName(user.getBankName() != null ? user.getBankName() : "State Bank of India");
            bank.setAccountNumber("**** " + (1000 + new java.util.Random().nextInt(8999)));
            bank.setBalance(50000.00); // Default Mock Balance
            bank.setPrimary(true);
            bankRepo.save(bank);
        } else if (user.getBankName() != null && !user.getBankName().equals(bank.getBankName())) {
            bank.setBankName(user.getBankName());
            bankRepo.save(bank);
        }

        if (bank.getBalance() < amount) {
            // We throw wrapper exception that Controller can catch or bubble up
            throw new RuntimeException("Insufficient Bank Balance! (Available: ₹" + bank.getBalance() + ")");
        }

        // Deduct from Bank
        bank.setBalance(bank.getBalance() - amount);
        bankRepo.save(bank);

        // Add to Wallet
        Wallet wallet = walletRepo.findByUser(user);
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepo.save(wallet);

        Transaction tx = new Transaction();
        tx.setAmount(amount);
        tx.setType("CREDIT");
        tx.setMessage("Added from " + bank.getBankName());
        tx.setWallet(wallet);
        txRepo.save(tx);

        return wallet;
    }

    // -------------------------------
    // SEND MONEY (PayThm ID / Email / Name)
    // -------------------------------
    public String sendMoney(Long senderId, String receiverIdentifier, double amount) {
        User sender = userRepo.findById(senderId).orElse(null);
        if (sender == null)
            return "Sender not found";

        User receiver = null;

        // ---------------------------------------------------------
        // ROBUST USER LOOKUP LOGIC
        // ---------------------------------------------------------

        // 1. Try as PayThm ID (Exact Match)
        if (receiver == null) {
            receiver = userRepo.findByPaythmId(receiverIdentifier).orElse(null);
        }

        // 2. Try as Phone Number (Smart Matching)
        // Checks exact match, then with +91, then without +91
        if (receiver == null && receiverIdentifier.matches("^[0-9+]+$")) {
            // A. Exact
            List<User> list = userRepo.findByPhone(receiverIdentifier);
            if (!list.isEmpty())
                receiver = list.get(0);

            // B. Verify +91 Case
            if (receiver == null) {
                if (receiverIdentifier.length() == 10) {
                    list = userRepo.findByPhone("+91" + receiverIdentifier);
                    if (!list.isEmpty())
                        receiver = list.get(0);
                } else if (receiverIdentifier.startsWith("+91") && receiverIdentifier.length() == 13) {
                    list = userRepo.findByPhone(receiverIdentifier.substring(3));
                    if (!list.isEmpty())
                        receiver = list.get(0);
                }
            }
        }

        // 3. Try as Database User ID (Primary Key)
        if (receiver == null) {
            try {
                Long id = Long.parseLong(receiverIdentifier);
                // If ID is very large (likely a phone number), we skip this unless we failed
                // previous checks
                // But since we are here, phone lookup failed, so maybe it IS a real ID?
                receiver = userRepo.findById(id).orElse(null);
            } catch (NumberFormatException e) {
                // Not a number, ignore
            }
        }

        // 4. VPA Logic (legacy support for @domain format)
        if (receiver == null && receiverIdentifier.contains("@")) {
            String[] parts = receiverIdentifier.split("@");
            if (parts.length > 0) {
                String core = parts[0];
                // Lookup core as paythmId or phone
                receiver = userRepo.findByPaythmId(core).orElse(null);
                if (receiver == null && core.matches("\\d+")) {
                    List<User> pList = userRepo.findByPhone(core);
                    if (!pList.isEmpty())
                        receiver = pList.get(0);
                }
            }
        }

        // 5. Try as Email
        if (receiver == null) {
            List<User> emailUsers = userRepo.findByEmail(receiverIdentifier);
            if (!emailUsers.isEmpty())
                receiver = emailUsers.get(0);
        }

        // 6. Try as Name
        if (receiver == null) {
            List<User> nameUsers = userRepo.findByFullNameIgnoreCase(receiverIdentifier);
            if (!nameUsers.isEmpty())
                receiver = nameUsers.get(0);
            else {
                nameUsers = userRepo.findByFullNameContainingIgnoreCase(receiverIdentifier);
                if (!nameUsers.isEmpty())
                    receiver = nameUsers.get(0);
            }
        }

        if (receiver == null) {
            return "Receiver not found! (Checked Phone, ID, Email)";
        }

        if (sender.getId().equals(receiver.getId())) {
            return "Cannot send money to yourself!";
        }

        Wallet w1 = walletRepo.findByUser(sender);
        Wallet w2 = walletRepo.findByUser(receiver);

        if (w1.getBalance() < amount) {
            return "Insufficient balance!";
        }

        w1.setBalance(w1.getBalance() - amount);
        walletRepo.save(w1);

        w2.setBalance(w2.getBalance() + amount);
        walletRepo.save(w2);

        Transaction t1 = new Transaction();
        t1.setAmount(amount);
        t1.setType("DEBIT");
        t1.setMessage("Sent to " + receiver.getFullName());
        t1.setWallet(w1);
        txRepo.save(t1);

        Transaction t2 = new Transaction();
        t2.setAmount(amount);
        t2.setType("CREDIT");
        t2.setMessage("Received from " + sender.getFullName());
        t2.setWallet(w2);
        txRepo.save(t2);

        checkAndApplyRewards(sender, w1);

        return "Money Sent Successfully!";
    }

    // -------------------------------
    // SEND MONEY VIA UPI (mock implementation)
    // -------------------------------
    public String sendMoneyViaUpi(Long senderId, String upiId, double amount) {
        User sender = userRepo.findById(senderId).orElse(null);
        if (sender == null)
            return "Sender not found";
        Wallet wallet = walletRepo.findByUser(sender);
        if (wallet.getBalance() < amount)
            return "Insufficient balance!";
        wallet.setBalance(wallet.getBalance() - amount);
        walletRepo.save(wallet);
        Transaction tx = new Transaction();
        tx.setAmount(amount);
        tx.setType("DEBIT");
        tx.setMessage("Sent via UPI to " + upiId);
        tx.setWallet(wallet);
        txRepo.save(tx);
        checkAndApplyRewards(sender, wallet);
        return "UPI Transfer Successful";
    }

    // -------------------------------
    // SEND MONEY VIA BANK (mock implementation)
    // -------------------------------
    public String sendMoneyViaBank(Long senderId, String accountNumber, String ifsc, String recipientName,
            double amount) {
        User sender = userRepo.findById(senderId).orElse(null);
        if (sender == null)
            return "Sender not found";
        Wallet wallet = walletRepo.findByUser(sender);
        if (wallet.getBalance() < amount)
            return "Insufficient balance!";
        wallet.setBalance(wallet.getBalance() - amount);
        walletRepo.save(wallet);
        Transaction tx = new Transaction();
        tx.setAmount(amount);
        tx.setType("DEBIT");
        tx.setMessage("Bank transfer to " + recipientName + " (Acc: " + accountNumber + ")");
        tx.setWallet(wallet);
        txRepo.save(tx);
        checkAndApplyRewards(sender, wallet);
        return "Bank Transfer Successful";
    }

    // -------------------------------
    // HISTORY
    // -------------------------------
    public List<Transaction> history(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        Wallet wallet = walletRepo.findByUser(user);
        return txRepo.findByWallet(wallet);
    }

    // -------------------------------
    // GET BANK DETAILS
    // -------------------------------
    public com.paythm.paythm_api.entity.BankAccount getBankDetails(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null)
            return null;

        List<com.paythm.paythm_api.entity.BankAccount> banks = bankRepo.findByUserAndIsPrimaryTrue(user);
        com.paythm.paythm_api.entity.BankAccount bank = banks.isEmpty() ? null : banks.get(0);

        if (bank == null) {
            // Create default if missing
            bank = new com.paythm.paythm_api.entity.BankAccount();
            bank.setUser(user);
            bank.setBankName(user.getBankName() != null ? user.getBankName() : "State Bank of India");
            bank.setAccountNumber("**** " + (1000 + new java.util.Random().nextInt(8999)));
            bank.setBalance(50000.00);
            bank.setPrimary(true);
            bankRepo.save(bank);
        } else if (user.getBankName() != null && !user.getBankName().equals(bank.getBankName())) {
            // Sync Bank Name if user profile updates
            bank.setBankName(user.getBankName());
            bankRepo.save(bank);
        }
        return bank;
    }

    // -------------------------------
    // ALL TRANSACTIONS (Admin)
    // -------------------------------
    public List<Transaction> getAllTransactions() {
        return txRepo.findAll();
    }

    private void checkAndApplyRewards(User user, Wallet wallet) {
        long count = txRepo.countByWalletUserIdAndType(user.getId(), "DEBIT");
        if (count == 5) {
            double cashback = 50.0; // Fixed cashback for now
            wallet.setBalance(wallet.getBalance() + cashback);
            walletRepo.save(wallet);

            Transaction tx = new Transaction();
            tx.setAmount(cashback);
            tx.setType("CREDIT");
            tx.setMessage("🎉 Cashback Reward! (First 5 Payments)");
            tx.setWallet(wallet);
            txRepo.save(tx);
        } else if (count > 5 && count % 10 == 0) {
            // Milestone Reward every 10 txs
            double cashback = 10.0;
            wallet.setBalance(wallet.getBalance() + cashback);
            walletRepo.save(wallet);

            Transaction tx = new Transaction();
            tx.setAmount(cashback);
            tx.setType("CREDIT");
            tx.setMessage("🎁 Loyalty Bonus (Every 10 Payments)");
            tx.setWallet(wallet);
            txRepo.save(tx);
        }
    }
}
