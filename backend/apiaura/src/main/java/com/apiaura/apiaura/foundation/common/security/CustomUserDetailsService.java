package com.apiaura.apiaura.foundation.common.security;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Invalid email or password")
                );

        Set<GrantedAuthority> authorities = new HashSet<>();

        if (user.getRoles() != null) {
            user.getRoles().forEach(userRole -> {
                var role = userRole.getRole();
                if (role != null) {
                    if (role.getCode() != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getCode()));
                    }
                    if (role.getPermissions() != null) {
                        role.getPermissions().forEach(rolePermission -> {
                            var permission = rolePermission.getPermission();
                            if (permission != null && permission.getCode() != null) {
                                authorities.add(new SimpleGrantedAuthority(permission.getCode()));
                            }
                        });
                    }
                }
            });
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .disabled(user.getStatus() != UserStatus.ACTIVE)
                .authorities(authorities)
                .build();
    }
}

