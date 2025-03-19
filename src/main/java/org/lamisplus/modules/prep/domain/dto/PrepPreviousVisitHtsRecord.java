package org.lamisplus.modules.prep.domain.dto;

import java.time.LocalDate;

public interface PrepPreviousVisitHtsRecord {

    String getHivTestResult();
    LocalDate getVisitDate();
}
