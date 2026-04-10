package com.example.agent.model;

import jakarta.validation.constraints.NotBlank;

public record AgentRequest(
    @NotBlank(message = "prompt cannot be empty")
    String prompt,
    String language
) {
}
