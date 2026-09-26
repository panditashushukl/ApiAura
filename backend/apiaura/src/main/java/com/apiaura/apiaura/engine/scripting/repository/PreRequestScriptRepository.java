package com.apiaura.apiaura.engine.scripting.repository;

import com.apiaura.apiaura.engine.scripting.entity.PreRequestScript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PreRequestScriptRepository
        extends JpaRepository<PreRequestScript, UUID> {

    Optional<PreRequestScript> findByRequestId(UUID requestId);

    boolean existsByRequestId(UUID requestId);
}
