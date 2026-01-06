package com.paythm.paythm_api.repository;

import com.paythm.paythm_api.entity.Transaction;
import com.paythm.paythm_api.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // find all transactions for a wallet
    List<Transaction> findByWallet(Wallet wallet);

    // find all transactions for user id (through wallet.user.id)
    @Query("select t from Transaction t where t.wallet.user.id = :userId")
    List<Transaction> findByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.wallet.user.id = :userId AND t.type = 'DEBIT'")
    Double calculateTotalSpent(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.wallet.user.id = :userId AND t.type = 'CREDIT'")
    Double calculateTotalReceived(@Param("userId") Long userId);

    long countByWalletUserIdAndType(Long userId, String type);
}
