package com.example.mcp.model;

import java.util.List;

public record SearchResponse(
    List<ProductDto> products,
    int total
) {
}
