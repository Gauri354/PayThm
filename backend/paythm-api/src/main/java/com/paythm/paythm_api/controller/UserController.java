package com.paythm.paythm_api.controller;

import com.paythm.paythm_api.dto.LoginResponse;
import com.paythm.paythm_api.dto.UserLoginRequest;
import com.paythm.paythm_api.entity.User;
import com.paythm.paythm_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.createUser(user));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("User already exists with this Email or Phone.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Signup Failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequest request) {
        User user = userService.login(request);

        // send token + user
        String fakeToken = UUID.randomUUID().toString();

        return ResponseEntity.ok(new LoginResponse(fakeToken, user));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAll());
    }

    @PutMapping("/kyc/{userId}/{status}")
    public ResponseEntity<?> updateKyc(@PathVariable Long userId, @PathVariable String status) {
        return ResponseEntity.ok(userService.updateKycStatus(userId, status));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PostMapping("/verify-pin")
    public ResponseEntity<?> verifyPin(@RequestBody java.util.Map<String, String> request) {
        Long userId = Long.valueOf(request.get("userId"));
        String pin = request.get("pin");

        boolean isValid = userService.verifyPin(userId, pin);
        return ResponseEntity.ok(isValid);
    }
}
