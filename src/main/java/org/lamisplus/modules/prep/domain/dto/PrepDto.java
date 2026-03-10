package org.lamisplus.modules.prep.domain.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class PrepDto implements Serializable {

    private Long id;

    private LocalDate dateStarted;

    private Object extra;

    private String status;
}
