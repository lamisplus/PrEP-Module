package org.lamisplus.modules.prep.config;

import org.lamisplus.modules.base.domain.entities.Audit;
import org.lamisplus.modules.base.security.SecurityUtils;

import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;


public class PrepAuditListener {

    @PrePersist
    public void stampOnCreate(Audit<?> entity) {
        String login = currentLogin();
        if (login == null) return;
        entity.setCreatedBy(login);
        entity.setModifiedBy(login);
    }

    @PreUpdate
    public void stampOnUpdate(Audit<?> entity) {
        String login = currentLogin();
        if (login == null) return;
        entity.setModifiedBy(login);
    }


    private static String currentLogin() {
        String login = SecurityUtils.getCurrentUserLogin().orElse(null);
        return login == null || login.trim().isEmpty() ? null : login;
    }
}
