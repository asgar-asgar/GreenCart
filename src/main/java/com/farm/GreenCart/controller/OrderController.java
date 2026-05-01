package com.farm.GreenCart.controller;

import com.farm.GreenCart.dto.OrderRequest;
import com.farm.GreenCart.entity.Order;
import com.farm.GreenCart.entity.User;
import com.farm.GreenCart.service.OrderService;
import com.farm.GreenCart.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    // Consumer places order
    @PostMapping("/place")
    public ResponseEntity<Map<String, Object>> placeOrder(
            @RequestBody OrderRequest request,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();
        Long consumerId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        if (consumerId == null || !role.equals("CONSUMER")) {
            response.put("success", false);
            response.put("message", "Unauthorized");
            return ResponseEntity.status(403).body(response);
        }

        Optional<User> consumerOpt = userService.findById(consumerId);
        if (consumerOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Consumer not found");
            return ResponseEntity.badRequest().body(response);
        }

        Order order = orderService.placeOrder(request, consumerOpt.get());
        response.put("success", true);
        response.put("orderId", order.getId());
        response.put("message", "Order placed successfully");
        return ResponseEntity.ok(response);
    }

    // Consumer views their orders
    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(HttpSession session) {
        Long consumerId = (Long) session.getAttribute("userId");
        if (consumerId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(orderService.getConsumerOrders(consumerId));
    }

    // Farmer views incoming orders
    @GetMapping("/incoming")
    public ResponseEntity<List<Order>> getIncomingOrders(HttpSession session) {
        Long farmerId = (Long) session.getAttribute("userId");
        if (farmerId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(orderService.getFarmerOrders(farmerId));
    }

    // Farmer marks order as delivered
    @PutMapping("/{orderId}/deliver")
    public ResponseEntity<Map<String, Object>> markDelivered(
            @PathVariable Long orderId,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();
        Long farmerId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        if (farmerId == null || !role.equals("FARMER")) {
            response.put("success", false);
            response.put("message", "Unauthorized");
            return ResponseEntity.status(403).body(response);
        }

        Order order = orderService.markAsDelivered(orderId);
        response.put("success", true);
        response.put("message", "Order marked as delivered");
        response.put("status", order.getStatus());
        return ResponseEntity.ok(response);
    }

    // Farmer marks out for delivery
    @PutMapping("/{orderId}/out-for-delivery")
    public ResponseEntity<Map<String, Object>> markOutForDelivery(
            @PathVariable Long orderId,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();
        Long farmerId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        if (farmerId == null || !role.equals("FARMER")) {
            response.put("success", false);
            response.put("message", "Unauthorized");
            return ResponseEntity.status(403).body(response);
        }

        Order order = orderService.markOutForDelivery(orderId);
        response.put("success", true);
        response.put("message", "Order marked as out for delivery");
        response.put("status", order.getStatus());
        return ResponseEntity.ok(response);
    }

}