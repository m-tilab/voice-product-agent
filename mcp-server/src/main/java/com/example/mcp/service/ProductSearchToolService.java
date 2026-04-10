package com.example.mcp.service;

import com.example.mcp.model.SearchResponse;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class ProductSearchToolService {

    private final RestClient restClient;
    private final String productApiUrl;

    public ProductSearchToolService(RestClient restClient,
                                    @Value("${app.product-api-url}") String productApiUrl) {
        this.restClient = restClient;
        this.productApiUrl = productApiUrl;
    }

    @Tool(description = """
        Search for products by natural language query with optional category and price filters.
        Returns matching products from the catalog.
        """)
    public SearchResponse searchProducts(String query,
                                         String category,
                                         Double minPrice,
                                         Double maxPrice,
                                         Integer limit) {
        var safeLimit = limit == null || limit < 1 ? 5 : Math.min(limit, 10);
        var uriBuilder = UriComponentsBuilder
            .fromHttpUrl(productApiUrl + "/api/products/search")
            .queryParam("q", query)
            .queryParam("limit", safeLimit);

        if (category != null && !category.isBlank()) {
            uriBuilder.queryParam("category", category);
        }
        if (minPrice != null && minPrice > 0) {
            uriBuilder.queryParam("minPrice", minPrice);
        }
        if (maxPrice != null && maxPrice > 0) {
            uriBuilder.queryParam("maxPrice", maxPrice);
        }

        return restClient.get()
            .uri(uriBuilder.encode().build().toUri())
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .body(SearchResponse.class);
    }
}
