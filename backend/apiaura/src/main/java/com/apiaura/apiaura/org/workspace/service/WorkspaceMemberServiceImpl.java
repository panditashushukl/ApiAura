package com.apiaura.apiaura.org.workspace.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceMemberServiceImpl
        implements WorkspaceMemberService {

    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WorkspaceMember addMember(
            UUID workspaceId,
            UUID userId,
            UUID invitedBy
    ) {

        Workspace workspace =
                workspaceRepository.findById(workspaceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Workspace not found"
                                )
                        );

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        if (memberRepository.existsByWorkspaceIdAndUserId(
                workspaceId,
                userId
        )) {
            throw new BadRequestException(
                    "User is already a workspace member"
            );
        }

        User inviter =
                userRepository.findById(invitedBy)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inviting user not found"
                                )
                        );

        WorkspaceMember member =
                new WorkspaceMember();

        member.setWorkspace(workspace);
        member.setUser(user);
        member.setInvitedBy(inviter);
        member.setStatus("ACTIVE");
        member.setJoinedAt(Instant.now());

        return memberRepository.save(member);
    }

    @Override
    public List<WorkspaceMember> getMembers(
            UUID workspaceId
    ) {

        if (!workspaceRepository.existsById(workspaceId)) {
            throw new ResourceNotFoundException(
                    "Workspace not found"
            );
        }

        return memberRepository.findByWorkspaceId(
                workspaceId
        );
    }

    @Override
    public WorkspaceMember getMember(
            UUID workspaceId,
            UUID userId
    ) {

        return memberRepository
                .findByWorkspaceIdAndUserId(
                        workspaceId,
                        userId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace membership not found"
                        )
                );
    }

    @Override
    @Transactional
    public void removeMember(
            UUID workspaceId,
            UUID userId
    ) {

        if (!memberRepository.existsByWorkspaceIdAndUserId(
                workspaceId,
                userId
        )) {
            throw new ResourceNotFoundException(
                    "Workspace membership not found"
            );
        }

        memberRepository.deleteByWorkspaceIdAndUserId(
                workspaceId,
                userId
        );
    }
}
