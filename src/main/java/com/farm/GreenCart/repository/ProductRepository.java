package com.farm.GreenCart.repository;

import com.farm.GreenCart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByFarmerId(Long farmerId);
    List<Product> findByAvailabilityTrue();
    List<Product> findByCategoryAndAvailabilityTrue(String category);
}