package org.lamisplus.modules.hiv.domain.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegimenRequestDto {
    private Long id;
    private Integer dispenseQuantity;
}
