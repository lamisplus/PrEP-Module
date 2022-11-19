package org.lamisplus.modules.prep.domain.mapper;

import org.lamisplus.modules.prep.domain.dto.PrepEnrollmentRequestDto;
import org.lamisplus.modules.prep.domain.entity.PrepEnrollment;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface PrepClientMapper {
    PrepEnrollmentRequestDto prepClientToPrepClientDto(PrepEnrollment prepEnrollment);

    PrepEnrollment prepClientDtoToPrepClient(PrepEnrollmentRequestDto prepEnrollmentRequestDto);

    List<PrepEnrollment> prepClientDtosToPrepClients(List<PrepEnrollmentRequestDto> prepEnrollmentRequestDto);

    List<PrepEnrollmentRequestDto> prepClientsToPrepClientDtos(List<PrepEnrollment> prepEnrollment);
}
