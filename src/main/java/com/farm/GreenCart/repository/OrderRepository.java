package com.farm.GreenCart.repository;

import com.farm.GreenCart.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByConsumerIdOrderByCreatedAtDesc(Long consumerId);
    List<Order> findByOrderItems_Product_FarmerIdOrderByCreatedAtDesc(Long farmerId);
}