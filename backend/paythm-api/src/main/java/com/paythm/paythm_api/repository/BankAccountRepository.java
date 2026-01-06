package com.paythm.paythm_api.repository;

import com.paythm.paythm_api.entity.BankAccount;
import com.paythm.paythm_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
// imp removed
import java.util.List;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByUser(User user);

    List<BankAccount> findByUserAndIsPrimaryTrue(User user);
}
