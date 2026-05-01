package com.farm.GreenCart.service;

import com.farm.GreenCart.entity.Product;
import com.farm.GreenCart.entity.User;
import com.farm.GreenCart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    private final String uploadDir = "uploads/products/";

    public Product addProduct(String name, String description, Double price,
                              Integer quantity, String category,
                              Boolean availability, MultipartFile image,
                              User farmer) throws IOException {

        // Save image to uploads folder
        Files.createDirectories(Paths.get(uploadDir));
        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setQuantity(quantity);
        product.setCategory(category);
        product.setAvailability(availability);
        product.setImagePath("/uploads/products/" + fileName);
        product.setFarmer(farmer);

        return productRepository.save(product);
    }

    public List<Product> getAllAvailableProducts() {
        return productRepository.findByAvailabilityTrue();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndAvailabilityTrue(category);
    }

    public List<Product> getFarmerProducts(Long farmerId) {
        return productRepository.findByFarmerId(farmerId);
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }
}