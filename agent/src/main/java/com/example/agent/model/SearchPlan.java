package com.example.agent.model;

public record SearchPlan(
    String query,
    String category,
    Double minPrice,
    Double maxPrice,
    Integer limit,
    String responseLanguage
) {
    public SearchPlan normalized(String fallbackPrompt, String fallbackLanguage) {
        return new SearchPlan(
            query == null || query.isBlank() ? fallbackPrompt : query.trim(),
            category == null ? "" : category.trim(),
            minPrice,
            maxPrice,
            limit == null || limit < 1 ? 5 : Math.min(limit, 10),
            responseLanguage == null || responseLanguage.isBlank() ? fallbackLanguage : responseLanguage.trim()
        );
    }
}
