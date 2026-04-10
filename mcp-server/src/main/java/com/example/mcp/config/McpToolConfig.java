package com.example.mcp.config;

import com.example.mcp.service.ProductSearchToolService;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class McpToolConfig {

    @Bean
    RestClient restClient(RestClient.Builder builder) {
        return builder.build();
    }

    @Bean
    ToolCallbackProvider productSearchTools(ProductSearchToolService productSearchToolService) {
        return MethodToolCallbackProvider.builder()
            .toolObjects(productSearchToolService)
            .build();
    }
}
