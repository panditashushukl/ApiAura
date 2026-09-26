package com.apiaura.apiaura.engine.ai.provider;

import java.util.List;

public interface AiProvider {

    AiProviderResponse generate(
            String systemPrompt,
            List<AiProviderMessage> messages,
            List<AiProviderTool> tools
    );
}
