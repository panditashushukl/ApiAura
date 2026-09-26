package com.apiaura.apiaura.engine.scripting.repository;

import com.apiaura.apiaura.engine.scripting.entity.PostRequestScript;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PostRequestScriptRepository
        extends JpaRepository<PostRequestScript, UUID> {

    Optional<PostRequestScript> findByRequestId(UUID requestId);

    boolean existsByRequestId(UUID requestId);
}
