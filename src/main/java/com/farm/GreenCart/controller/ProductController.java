package com.farm.GreenCart.controller;

import com.farm.GreenCart.entity.Product;
import com.farm.GreenCart.entity.User;
import com.farm.GreenCart.service.ProductService;
import com.farm.GreenCart.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    // Farmer adds product
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam Integer quantity,
            @RequestParam String category,
            @RequestParam Boolean availability,
            @RequestParam MultipartFile image,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        Long farmerId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        if (farmerId == null || !role.equals("FARMER")) {
            response.put("success", false);
            response.put("message", "Unauthorized");
            return ResponseEntity.status(403).body(response);
        }

        try {
            Optional<User> farmerOpt = userService.findById(farmerId);
            if (farmerOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Farmer not found");
                return ResponseEntity.badRequest().body(response);
            }

            Product product = productService.addProduct(
                    name, description, price, quantity,
                    category, availability, image, farmerOpt.get()
            );

            response.put("success", true);
            response.put("message", "Product added successfully");
            response.put("productId", product.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Consumer views all products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category) {

        if (category != null && !category.equals("All")) {
            return ResponseEntity.ok(productService.getProductsByCategory(category));
        }
        return ResponseEntity.ok(productService.getAllAvailableProducts());
    }

    // Farmer views their own products
    @GetMapping("/my")
    public ResponseEntity<List<Product>> getMyProducts(HttpSession session) {
        Long farmerId = (Long) session.getAttribute("userId");
        if (farmerId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(productService.getFarmerProducts(farmerId));
    }
}