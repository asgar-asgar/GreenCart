package com.farm.GreenCart.service;

import com.farm.GreenCart.dto.OrderRequest;
import com.farm.GreenCart.entity.*;
import com.farm.GreenCart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public Order placeOrder(OrderRequest request, User consumer) {
        Order order = new Order();
        order.setConsumer(consumer);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setStatus("ORDER_PLACED");
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItem> items = new ArrayList<>();
        double total = 0;

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Optional<Product> productOpt = productRepository.findById(itemReq.getProductId());

            if (productOpt.isPresent()) {
                Product product = productOpt.get();

                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProduct(product);
                item.setQuantity(itemReq.getQuantity());
                item.setPrice(product.getPrice() * itemReq.getQuantity());

                total += item.getPrice();
                items.add(item);

                // Reduce stock
                product.setQuantity(product.getQuantity() - itemReq.getQuantity());
                productRepository.save(product);
            }
        }

        order.setTotalAmount(total);
        order.setOrderItems(items);

        return orderRepository.save(order);
    }

    public List<Order> getConsumerOrders(Long consumerId) {
        return orderRepository.findByConsumerIdOrderByCreatedAtDesc(consumerId);
    }

    public List<Order> getFarmerOrders(Long farmerId) {
        return orderRepository.findByOrderItems_Product_FarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    public Order markOutForDelivery(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus("OUT_FOR_DELIVERY");
            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found");
    }

    public Order markAsDelivered(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus("DELIVERED");
            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found");
    }


}