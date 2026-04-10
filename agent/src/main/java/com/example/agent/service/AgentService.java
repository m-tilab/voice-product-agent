package com.example.agent.service;

import ai.koog.agents.core.agent.AIAgent;
import com.example.agent.model.AgentRequest;
import com.example.agent.model.AgentResponse;
import com.example.agent.model.ProductSearchResponse;
import com.example.agent.model.SearchPlan;
import com.example.agent.model.SummaryPayload;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AgentService {

    private static final Logger log = LoggerFactory.getLogger(AgentService.class);

    private final AIAgent<String, String> searchPlanAgent;
    private final AIAgent<String, String> summaryAgent;
    private final ProductSearchGateway productSearchGateway;
    private final ObjectMapper objectMapper;

    public AgentService(@Qualifier("searchPlanAgent") AIAgent<String, String> searchPlanAgent,
                        @Qualifier("summaryAgent") AIAgent<String, String> summaryAgent,
                        ProductSearchGateway productSearchGateway,
                        ObjectMapper objectMapper) {
        this.searchPlanAgent = searchPlanAgent;
        this.summaryAgent = summaryAgent;
        this.productSearchGateway = productSearchGateway;
        this.objectMapper = objectMapper;
    }

    public AgentResponse processRequest(AgentRequest request) {
        SearchPlan searchPlan = buildSearchPlan(request).normalized(request.prompt(), request.language());
        ProductSearchResponse searchResponse = productSearchGateway.searchProducts(searchPlan);
        String message = buildSummary(request, searchPlan, searchResponse);

        return new AgentResponse(
            searchResponse.products() == null ? List.of() : searchResponse.products(),
            message,
            request.prompt(),
            request.language()
        );
    }

    private SearchPlan buildSearchPlan(AgentRequest request) {
        String content = askKoog(
            searchPlanAgent,
            """
                language: %s
                request: %s
                """.formatted(blankToEmpty(request.language()), request.prompt())
        );

        try {
            return objectMapper.readValue(content, SearchPlan.class);
        } catch (JsonProcessingException ex) {
            log.warn("Could not parse search plan JSON: {}", content, ex);
            return new SearchPlan(request.prompt(), "", null, null, 5, request.language());
        }
    }

    private String buildSummary(AgentRequest request, SearchPlan searchPlan, ProductSearchResponse searchResponse) {
        String productsJson = writeJson(searchResponse);
        String content = askKoog(
            summaryAgent,
            """
                original request: %s
                response language: %s
                search plan: %s
                products: %s
                """.formatted(
                request.prompt(),
                blankToEmpty(searchPlan.responseLanguage()),
                writeJson(searchPlan),
                productsJson
            )
        );

        try {
            SummaryPayload payload = objectMapper.readValue(content, SummaryPayload.class);
            if (payload.message() != null && !payload.message().isBlank()) {
                return payload.message();
            }
        } catch (JsonProcessingException ex) {
            log.warn("Could not parse summary JSON: {}", content, ex);
        }

        int total = searchResponse.total();
        return total == 0
            ? "No matching products were found."
            : "Found %d matching product%s.".formatted(total, total == 1 ? "" : "s");
    }

    private String askKoog(AIAgent<String, String> agent, String prompt) {
        String content = agent.run(prompt);
        if (content != null && !content.isBlank()) {
            return content.trim();
        }

        throw new IllegalStateException("Koog returned an empty response");
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Could not serialize agent payload", ex);
        }
    }

    private String blankToEmpty(String value) {
        return value == null ? "" : value;
    }
}
