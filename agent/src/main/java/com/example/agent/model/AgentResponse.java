package com.example.agent.model;

import java.util.List;

public record AgentResponse(
    List<ProductResult> products,
    String message,
    String transcript,
    String detectedLanguage
) {
}
