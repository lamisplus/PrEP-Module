package org.lamisplus.modules.hiv.domain.dto;

import java.time.LocalDate;

public interface LabEacInfo {
  Long getPatientId();
  Long getTestResultId();
  String getTestGroup();
  String getTestName();
  String getLabNumber();
  LocalDate getResultDate();
  Long getResult();
  
}

