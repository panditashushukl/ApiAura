package com.apiaura.apiaura.engine.ai.tool;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class AiToolRegistry {

    private final Map<String, AiTool> tools;

    public AiToolRegistry(
            List<AiTool> tools
    ) {
        this.tools = tools.stream()
                .collect(
                        Collectors.toUnmodifiableMap(
                                AiTool::getName,
                                Function.identity()
                        )
                );
    }

    public AiTool get(
            String name
    ) {
        AiTool tool = tools.get(name);

        if (tool == null) {
            throw new IllegalArgumentException(
                    "Unknown AI tool: " + name
            );
        }

        return tool;
    }

    public List<AiTool> getAll() {
        return tools.values()
                .stream()
                .toList();
    }
}