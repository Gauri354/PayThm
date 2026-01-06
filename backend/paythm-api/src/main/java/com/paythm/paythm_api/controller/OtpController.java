package com.paythm.paythm_api.controller;

import com.paythm.paythm_api.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class OtpController {

    @Autowired
    private EmailService emailService;

    // Temporary storage for OTPs (In production use Redis or Database)
    private static final Map<String, String> otpStorage = new HashMap<>();

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, String> response = new HashMap<>();

        if (email == null || email.isEmpty()) {
            response.put("error", "Email is required");
            return response;
        }

        // Generate 4-digit OTP
        String otp = String.format("%04d", new Random().nextInt(10000));
        otpStorage.put(email, otp);

        try {
            emailService.sendSimpleMessage(
                    email,
                    "Your PayThm Verification Code",
                    "Welcome to PayThm! Your verification code is: " + otp);
            response.put("message", "OTP sent successfully to " + email);
        } catch (Exception e) {
            // Fallback for demo if SMTP isn't configured
            System.err.println("Failed to send email: " + e.getMessage());
            response.put("message", "OTP generated (Email Failed): " + otp);
            response.put("dev_otp", otp); // ONLY FOR DEV
        }

        return response;
    }

    // Optional: Verify Endpoint (or just do it on signup)
    @PostMapping("/verify-otp")
    public boolean verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email != null && otpStorage.containsKey(email)) {
            return otpStorage.get(email).equals(otp);
        }
        return false;
    }
}
