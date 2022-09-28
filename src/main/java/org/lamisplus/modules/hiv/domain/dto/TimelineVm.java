package org.lamisplus.modules.hiv.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class TimelineVm {
    private String date;
    private List<PatientActivity> activities;
}
