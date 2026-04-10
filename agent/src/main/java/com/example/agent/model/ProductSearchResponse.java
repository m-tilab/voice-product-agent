package com.example.agent.model;

import java.util.List;

public record ProductSearchResponse(
    List<ProductResult> products,
    int total
) {
}
