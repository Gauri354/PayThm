package com.paythm.paythm_api.config;

import com.paythm.paythm_api.entity.User;
import com.paythm.paythm_api.repository.UserRepository;
import com.paythm.paythm_api.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- CHECKING & SEEDING DEMO USERS ---");
        seedUser("Rahul Varma", "rahul@paythm.com", "9000012345");
        seedUser("Priya Sharma", "priya@paythm.com", "9000054321");
        seedUser("Mom", "mom@paythm.com", "9876543210");
        seedUser("Kirana Shop", "shop@paythm.com", "9111122222");
    }

    private void seedUser(String name, String email, String phone) {
        // Check by Email
        List<User> usersByEmail = userRepo.findByEmail(email);
        if (!usersByEmail.isEmpty())
            return;

        // Check by Phone
        List<User> usersByPhone = userRepo.findByPhone(phone);
        if (!usersByPhone.isEmpty())
            return;

        // Check by Name (Partial) to avoid dupes if email/phone differs but intent is
        // same
        // Actually, name dupes are allowed, so we rely on unique email/phone.

        try {
            User user = new User();
            user.setFullName(name);
            user.setEmail(email);
            user.setPhone(phone);
            user.setPassword("123456"); // Simple default
            user.setBankName("HDFC Bank");
            userService.register(user);
            System.out.println("✔ Seeded Demo User: " + name);
        } catch (Exception e) {
            System.out.println("⚠ Failed to seed " + name + ": " + e.getMessage());
        }
    }
}
