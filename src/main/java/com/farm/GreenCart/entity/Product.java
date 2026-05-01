package com.farm.GreenCart.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private String category;
    private String imagePath;
    private Boolean availability;

    @ManyToOne
    @JoinColumn(name = "farmer_id")
    @JsonIgnoreProperties({"password", "address"})
    private User farmer;
}