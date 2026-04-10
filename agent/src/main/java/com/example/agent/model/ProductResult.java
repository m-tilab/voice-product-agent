package com.example.agent.model;

public record ProductResult(
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
