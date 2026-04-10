package com.example.mcp.web;

import com.example.mcp.model.SearchResponse;
import com.example.mcp.service.ProductSearchToolService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
public class McpController {

    private final ProductSearchToolService productSearchToolService;

    public McpController(ProductSearchToolService productSearchToolService) {
        this.productSearchToolService = productSearchToolService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "mcp-server");
    }

    @GetMapping("/tools")
    public Map<String, Object> tools() {
        return Map.of(
            "name", "search_products",
            "description", "Search for products by query with optional category/price filters",
            "parameters", List.of("q (required)", "category", "minPrice", "maxPrice", "limit")
        );
    }

    @GetMapping("/tools/search_products")
    @ResponseStatus(HttpStatus.OK)
    public SearchResponse searchProducts(@RequestParam("q") String query,
                                         @RequestParam(value = "category", required = false) String category,
                                         @RequestParam(value = "minPrice", required = false) Double minPrice,
                                         @RequestParam(value = "maxPrice", required = false) Double maxPrice,
                                         @RequestParam(value = "limit", required = false) Integer limit) {
        if (query == null || query.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "q cannot be empty");
        }

        return productSearchToolService.searchProducts(query, category, minPrice, maxPrice, limit);
    }
}
