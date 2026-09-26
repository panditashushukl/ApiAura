package com.apiaura.apiaura.engine.ai.security;

import com.apiaura.apiaura.ai.enums.AiActionRisk;
import org.springframework.stereotype.Component;

@Component
public class AiRiskClassifier {

    public AiActionRisk classify(String toolName) {

        return switch (toolName) {

            case "create_api_request",
                 "generate_api_test" ->
                    AiActionRisk.LOW;

            case "configure_api_request",
                 "create_workflow" ->
                    AiActionRisk.MEDIUM;

            case "execute_api_request",
                 "debug_execution" ->
                    AiActionRisk.HIGH;

            default ->
                    AiActionRisk.CRITICAL;
        };
    }

    public boolean requiresConfirmation(AiActionRisk risk) {
        return switch (risk) {
            case LOW -> false;
            case MEDIUM, HIGH, CRITICAL -> true;
        };
    }
}
