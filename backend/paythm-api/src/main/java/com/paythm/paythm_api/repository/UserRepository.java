package com.paythm.paythm_api.repository;

import com.paythm.paythm_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    java.util.List<User> findByEmail(String email);

    java.util.List<User> findByFullName(String fullName);

    java.util.List<User> findByFullNameIgnoreCase(String fullName);

    java.util.List<User> findByFullNameContainingIgnoreCase(String fullName);

    java.util.List<User> findByPhone(String phone);

    java.util.Optional<User> findByPaythmId(String paythmId);
}
