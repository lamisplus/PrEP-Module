package org.lamisplus.modules.prep.config;

import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.UserRepository;
import org.lamisplus.modules.base.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.lang.reflect.Method;
import java.util.function.Function;

/**
 * Wires a "current user UUID" resolver into {@link SecurityUtils} at startup so audit
 * fields ({@code created_by} / {@code modified_by}) record the user's stable UUID
 * instead of their username/email.
 *
 * Reflection is used so this PrEP-Module compiles even against an older Core/base-module
 * jar that doesn't yet expose {@code SecurityUtils.setCurrentUserUuidResolver(...)} or a
 * {@code User.getUuid()} method. When either is absent the resolver is silently skipped
 * and the legacy login-based audit behaviour stays in place.
 */
@Configuration
@Slf4j
public class CurrentUserUuidResolver {

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void init() {
        Method getUuid = findMethod(User.class, "getUuid");
        Method setResolver = findMethod(SecurityUtils.class, "setCurrentUserUuidResolver", Function.class);

        if (getUuid == null || setResolver == null) {
            log.info("Audit user-UUID resolver not wired — Core build does not expose User.getUuid()/SecurityUtils.setCurrentUserUuidResolver. Audit fields will keep using login.");
            return;
        }

        Function<String, String> resolver = login -> {
            try {
                return userRepository.findOneByUserName(login)
                        .map(user -> {
                            try {
                                Object uuid = getUuid.invoke(user);
                                return uuid == null ? login : uuid.toString();
                            } catch (Exception e) {
                                return login;
                            }
                        })
                        .orElse(login);
            } catch (Exception e) {
                return login;
            }
        };

        try {
            setResolver.invoke(null, resolver);
            log.info("Audit user-UUID resolver registered.");
        } catch (Exception e) {
            log.debug("Failed to register UUID resolver: {}", e.getMessage());
        }
    }

    private static Method findMethod(Class<?> klass, String name, Class<?>... params) {
        try {
            return klass.getMethod(name, params);
        } catch (NoSuchMethodException e) {
            return null;
        }
    }
}
