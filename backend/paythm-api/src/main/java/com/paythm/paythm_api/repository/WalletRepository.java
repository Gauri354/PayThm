package com.paythm.paythm_api.repository;

import com.paythm.paythm_api.entity.User;
import com.paythm.paythm_api.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Wallet findByUser(User user);

    java.util.Optional<Wallet> findByUserId(Long userId);
}
