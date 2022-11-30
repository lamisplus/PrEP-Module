package org.lamisplus.modules.prep.domain.mapper;

import org.lamisplus.modules.prep.domain.dto.PrepEligibilityRequestDto;
import org.lamisplus.modules.prep.domain.entity.PrepEligibility;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface PrepEligibilityMapper {
    PrepEligibility prepEligibilityRequestDtoToPrepEligibility(PrepEligibilityRequestDto prepEligibilityRequestDto);

    PrepEligibilityRequestDto prepEligibilityToPrepEligibilityRequestDto(PrepEligibility prepEligibility);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    PrepEligibility updatePrepEligibilityFromPrepEligibilityRequestDto(PrepEligibilityRequestDto prepEligibilityRequestDto, @MappingTarget PrepEligibility prepEligibility);
}
