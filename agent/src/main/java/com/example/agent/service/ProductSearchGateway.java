package com.example.agent.service;

import com.example.agent.model.ProductSearchResponse;
import com.example.agent.model.SearchPlan;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class ProductSearchGateway {

    private final RestClient restClient;
    private final String mcpServerUrl;

    public ProductSearchGateway(RestClient restClient,
                                @Value("${app.mcp-server-url}") String mcpServerUrl) {
        this.restClient = restClient;
        this.mcpServerUrl = mcpServerUrl;
    }

    public ProductSearchResponse searchProducts(SearchPlan plan) {
        var uriBuilder = UriComponentsBuilder
            .fromHttpUrl(mcpServerUrl + "/tools/search_products")
            .queryParam("q", plan.query())
            .queryParam("limit", plan.limit());

        if (plan.category() != null && !plan.category().isBlank()) {
            uriBuilder.queryParam("category", plan.category());
        }
        if (plan.minPrice() != null && plan.minPrice() > 0) {
            uriBuilder.queryParam("minPrice", plan.minPrice());
        }
        if (plan.maxPrice() != null && plan.maxPrice() > 0) {
            uriBuilder.queryParam("maxPrice", plan.maxPrice());
        }

        return restClient.get()
            .uri(uriBuilder.encode().build().toUri())
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .body(ProductSearchResponse.class);
    }
}
