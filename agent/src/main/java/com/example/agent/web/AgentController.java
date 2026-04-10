package com.example.agent.web;

import com.example.agent.model.AgentRequest;
import com.example.agent.model.AgentResponse;
import com.example.agent.service.AgentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "agent");
    }

    @PostMapping("/agent/search")
    @ResponseStatus(HttpStatus.OK)
    public AgentResponse search(@Valid @RequestBody AgentRequest request) {
        return agentService.processRequest(request);
    }
}
