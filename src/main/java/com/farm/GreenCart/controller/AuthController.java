package com.farm.GreenCart.controller;

import com.farm.GreenCart.dto.LoginRequest;
import com.farm.GreenCart.dto.RegisterRequest;
import com.farm.GreenCart.entity.User;
import com.farm.GreenCart.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.farm.GreenCart.entity.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = userService.register(request);
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request,
                                                     HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userService.login(request);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Store user info in session
            session.setAttribute("userId", user.getId());
            session.setAttribute("userRole", user.getRole());
            session.setAttribute("userName", user.getName());
            session.setAttribute("userEmail", user.getEmail());

            response.put("success", true);
            response.put("role", user.getRole());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("message", "Invalid email or password");
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            response.put("success", false);
            response.put("message", "Not logged in");
            return ResponseEntity.status(401).body(response);
        }

        // Fetch fresh user data from DB to get all fields
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(404).body(response);
        }

        User user = userOpt.get();
        response.put("success", true);
        response.put("userId", user.getId());
        response.put("role", user.getRole());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("mobile", user.getMobile());
        response.put("address", user.getAddress());
        return ResponseEntity.ok(response);
    }
}