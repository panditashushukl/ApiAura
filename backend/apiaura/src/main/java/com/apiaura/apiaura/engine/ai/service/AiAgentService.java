package com.apiaura.apiaura.engine.ai.service;

import com.apiaura.apiaura.engine.ai.provider.AiProviderMessage;
import com.apiaura.apiaura.engine.ai.tool.AiToolContext;

import java.util.List;

public interface AiAgentService {

    String process(
            AiToolContext context,
            List<AiProviderMessage> messages
    );
}
