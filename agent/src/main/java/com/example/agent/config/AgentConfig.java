package com.example.agent.config;

import ai.koog.agents.core.agent.AIAgent;
import ai.koog.prompt.executor.clients.openai.OpenAIModels;
import ai.koog.prompt.executor.model.PromptExecutor;
import ai.koog.prompt.llm.LLModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AgentConfig {

    @Bean
    RestClient restClient(RestClient.Builder builder) {
        return builder.build();
    }

    @Bean
    LLModel koogModel(@Value("${app.openai-model:gpt-4o}") String modelId) {
        return switch (modelId == null ? "" : modelId.trim()) {
            case "gpt-4o-mini" -> OpenAIModels.Chat.GPT4oMini;
            case "gpt-4.1" -> OpenAIModels.Chat.GPT4_1;
            case "gpt-4.1-mini" -> OpenAIModels.Chat.GPT4_1Mini;
            case "gpt-4.1-nano" -> OpenAIModels.Chat.GPT4_1Nano;
            case "gpt-5", "gpt-5.0" -> OpenAIModels.Chat.GPT5;
            case "gpt-5-mini" -> OpenAIModels.Chat.GPT5Mini;
            case "gpt-5-nano" -> OpenAIModels.Chat.GPT5Nano;
            default -> OpenAIModels.Chat.GPT4o;
        };
    }

    @Bean
    AIAgent<String, String> searchPlanAgent(@Qualifier("openAIExecutor") PromptExecutor promptExecutor,
                                            LLModel koogModel) {
        return AIAgent.builder()
            .<String, String>functionalStrategy("search-plan", (context, input) ->
                context.asAssistantMessage(context.requestLLM(input)).getContent()
            )
            .promptExecutor(promptExecutor)
            .llmModel(koogModel)
            .id("search-plan-agent")
            .systemPrompt("""
                You transform multilingual product requests into a strict JSON search plan for an English catalog.
                Return raw JSON only, with this exact shape:
                {"query":"...","category":"...","minPrice":null,"maxPrice":null,"limit":5,"responseLanguage":"..."}
                Rules:
                - Translate the searchable query to concise English product keywords.
                - Keep category empty when unknown.
                - Use null for unknown prices.
                - Limit must be between 1 and 10.
                - responseLanguage should match the user's language when provided, otherwise use English.
                """)
            .build();
    }

    @Bean
    AIAgent<String, String> summaryAgent(@Qualifier("openAIExecutor") PromptExecutor promptExecutor,
                                         LLModel koogModel) {
        return AIAgent.builder()
            .<String, String>functionalStrategy("search-summary", (context, input) ->
                context.asAssistantMessage(context.requestLLM(input)).getContent()
            )
            .promptExecutor(promptExecutor)
            .llmModel(koogModel)
            .id("summary-agent")
            .systemPrompt("""
                You are a product-search assistant.
                Return raw JSON only with this exact shape:
                {"message":"..."}
                Rules:
                - Write the message in the requested language when provided.
                - Mention the number of matching products.
                - If no products are found, say that clearly and briefly.
                - Do not include markdown.
                """)
            .build();
    }
}
