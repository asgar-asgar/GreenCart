package com.farm.GreenCart.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String mobile;
    private String address;
    private String role; // "FARMER" or "CONSUMER"
}