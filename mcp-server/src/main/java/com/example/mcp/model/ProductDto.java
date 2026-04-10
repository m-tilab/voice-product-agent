package com.example.mcp.model;

public record ProductDto(
    String id,
    String name,
    String description,
    double price,
    String currency,
    String imageUrl,
    String category,
    boolean inStock
) {
}
