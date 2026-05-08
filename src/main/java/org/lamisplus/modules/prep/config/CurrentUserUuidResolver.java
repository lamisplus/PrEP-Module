package org.lamisplus.modules.prep.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.base.domain.entities.User;
import org.lamisplus.modules.base.domain.repositories.UserRepository;
import org.lamisplus.modules.base.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

/**
 * Wires {@link SecurityUtils#setCurrentUserUuidResolver} at startup so audit
 * fields ({@code created_by} / {@code modified_by}) record the user's stable
 * UUID instead of their username/email. The resolver looks the user up by
 * login and returns {@code User.uuid}, falling back to the login when no UUID
 * is stored.
 */
@Configuration
@Slf4j
@RequiredArgsConstructor
public class CurrentUserUuidResolver {

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void init() {
        SecurityUtils.setCurrentUserUuidResolver(login -> {
            try {
                return userRepository.findOneByUserName(login)
                        .map(User::getUuid)
                        .filter(uuid -> uuid != null && !uuid.isEmpty())
                        .orElse(login);
            } catch (Exception e) {
                log.debug("UUID lookup failed for {}, falling back to login: {}", login, e.getMessage());
                return login;
            }
        });
        log.info("Audit user-UUID resolver registered.");
    }
}
