package com.apiaura.apiaura.engine.ai.provider;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Component
public class GeminiAiProvider implements AiProvider {

    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiAiProvider(
            @Value("${security.ai.gemini.api-key:}") String apiKey,
            @Value("${security.ai.gemini.model:gemini-1.5-flash}") String model,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = (model != null && !model.isBlank()) ? model : "gemini-1.5-flash";
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    @Override
    public AiProviderResponse generate(
            String systemPrompt,
            List<AiProviderMessage> messages,
            List<AiProviderTool> tools
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            return AiProviderResponse.text(
                    "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file."
            );
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();

            if (systemPrompt != null && !systemPrompt.isBlank()) {
                requestBody.put("system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ));
            }

            List<Map<String, Object>> contents = new ArrayList<>();
            if (messages != null) {
                for (AiProviderMessage msg : messages) {
                    String role = "user".equalsIgnoreCase(msg.role()) ? "user" : "model";
                    contents.add(Map.of(
                            "role", role,
                            "parts", List.of(Map.of("text", msg.content() != null ? msg.content() : ""))
                    ));
                }
            }
            if (contents.isEmpty()) {
                contents.add(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", "Hello"))
                ));
            }
            requestBody.put("contents", contents);

            if (tools != null && !tools.isEmpty()) {
                List<Map<String, Object>> functionDeclarations = new ArrayList<>();
                for (AiProviderTool t : tools) {
                    Map<String, Object> decl = new HashMap<>();
                    decl.put("name", t.name());
                    decl.put("description", t.description());
                    if (t.inputSchema() != null) {
                        decl.put("parameters", t.inputSchema());
                    }
                    functionDeclarations.add(decl);
                }
                requestBody.put("tools", List.of(Map.of("function_declarations", functionDeclarations)));
            }

            String jsonPayload = objectMapper.writeValueAsString(requestBody);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() != 200) {
                return AiProviderResponse.text("Gemini API Error (" + httpResponse.statusCode() + "): " + httpResponse.body());
            }

            JsonNode rootNode = objectMapper.readTree(httpResponse.body());
            JsonNode candidatesNode = rootNode.path("candidates");

            if (candidatesNode.isArray() && !candidatesNode.isEmpty()) {
                JsonNode firstCandidate = candidatesNode.get(0);
                JsonNode partsNode = firstCandidate.path("content").path("parts");

                if (partsNode.isArray() && !partsNode.isEmpty()) {
                    for (JsonNode part : partsNode) {
                        if (part.has("functionCall")) {
                            JsonNode functionCall = part.path("functionCall");
                            String toolName = functionCall.path("name").asText();
                            JsonNode args = functionCall.path("args");
                            String toolArgs = objectMapper.writeValueAsString(args);
                            return AiProviderResponse.toolCall(toolName, toolArgs);
                        } else if (part.has("text")) {
                            return AiProviderResponse.text(part.path("text").asText());
                        }
                    }
                }
            }

            return AiProviderResponse.text("No output generated by Gemini.");

        } catch (Exception e) {
            return AiProviderResponse.text("Error calling Gemini AI provider: " + e.getMessage());
        }
    }
}
