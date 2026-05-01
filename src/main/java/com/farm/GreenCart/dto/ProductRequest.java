package com.farm.GreenCart.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private String category;
    private Boolean availability;
}