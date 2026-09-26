package com.apiaura.apiaura.org.organization.repository;

import com.apiaura.apiaura.org.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository
        extends JpaRepository<Organization, UUID> {

    Optional<Organization> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Organization> findByOwnerId(UUID ownerId);

    long countByOwnerId(UUID ownerId);
}
