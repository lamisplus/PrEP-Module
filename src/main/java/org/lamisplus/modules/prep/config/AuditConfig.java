package org.lamisplus.modules.prep.config;

import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.UserRepository;
import org.lamisplus.modules.base.security.SecurityUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.lang.reflect.Method;
import java.util.Optional;

/**
 * Wires Spring Data JPA auditing so {@code @CreatedBy} / {@code @LastModifiedBy}
 * fields on every entity that extends {@code Audit} get populated with the user's
 * stable UUID (looked up from {@code base_application_user.uuid}) instead of the
 * login/email.
 *
 * Reflection is used to call {@code User.getUuid()} so this PrEP-Module compiles
 * even against an older Core/base-module jar that doesn't yet expose the UUID
 * column. When the column is missing, the auditor falls back to the login.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "userUuidAuditorAware")
@Slf4j
public class AuditConfig {

    @Bean
    public AuditorAware<String> userUuidAuditorAware(UserRepository userRepository) {
        Method getUuid = findGetUuid();
        return () -> {
            Optional<String> login = SecurityUtils.getCurrentUserLogin();
            if (!login.isPresent()) return Optional.empty();
            if (getUuid == null) return login;
            try {
                return userRepository.findOneByUserName(login.get())
                        .map(user -> {
                            try {
                                Object value = getUuid.invoke(user);
                                return value == null ? login.get() : value.toString();
                            } catch (Exception e) {
                                return login.get();
                            }
                        });
            } catch (Exception e) {
                return login;
            }
        };
    }

    private static Method findGetUuid() {
        try {
            return User.class.getMethod("getUuid");
        } catch (NoSuchMethodException e) {
            return null;
        }
    }
}
