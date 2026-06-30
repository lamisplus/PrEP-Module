package org.lamisplus.modules.prep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.lamisplus.modules.prep.domain.dto.KeysetPage;
import org.lamisplus.modules.prep.domain.dto.LatestHtsResultDto;
import org.lamisplus.modules.prep.domain.dto.PrepHtsPatientDto;
import org.lamisplus.modules.prep.domain.entity.PrepHtsPatient;
import org.lamisplus.modules.prep.domain.entity.PrepPepEnrolledReadModel;
import org.lamisplus.modules.prep.repository.PrepPepEnrolledReadModelRepository;
import org.lamisplus.modules.prep.repository.PrepPepInitiationRepository;
import org.lamisplus.modules.prep.util.EnrollmentType;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PROTOTYPE for the read-model + keyset-pagination approach on the PEP Patients
 * tab.
 *
 * <p><b>Refresh</b> runs the existing heavy {@code findPepEnrolled} query ONCE
 * (reusing the proven SQL — no transcription) and materialises its rows into
 * {@code prep_pep_enrolled_read_model}. That's the only O(n log n) work, and it
 * happens out-of-band, not on every page view.
 *
 * <p><b>Read</b> ({@link #getKeyset}) serves each page from the flat read model
 * via keyset pagination — a single index range scan, O(log n + page_size), with
 * no joins, no aggregation, and no total-count query.
 *
 * <p>Production would drive refresh from writes (save/discontinue) or a schedule
 * rather than a manual endpoint; that's out of scope for the prototype.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PepEnrolledReadModelService {

    private final PrepPepInitiationRepository prepPepInitiationRepository;
    private final PrepPepEnrolledReadModelRepository readModelRepository;
    private final CurrentUserOrganizationService currentUserOrganizationService;
    private final ObjectMapper objectMapper;

    /** Rebuild the current facility's slice of the read model. Returns row count. */
    @Transactional
    public int refresh() {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        List<PrepHtsPatient> rows = prepPepInitiationRepository
                .findPepEnrolled(false, facilityId, EnrollmentType.PEP,
                        PageRequest.of(0, Integer.MAX_VALUE))
                .getContent();
        readModelRepository.deleteByFacility(facilityId);
        List<PrepPepEnrolledReadModel> entities = rows.stream()
                .map(r -> toEntity(r, facilityId))
                .collect(Collectors.toList());
        readModelRepository.saveAll(entities);
        return entities.size();
    }

    @Transactional(readOnly = true)
    public KeysetPage<PrepHtsPatientDto> getKeyset(Long afterId, int pageSize, String searchValue) {
        Long facilityId = currentUserOrganizationService.getCurrentUserOrganization();
        String search = normalizeSearch(searchValue);
        // Fetch one extra row to know whether there's a next page.
        int limit = pageSize + 1;
        List<PrepPepEnrolledReadModel> rows = (afterId == null)
                ? readModelRepository.findFirstPage(facilityId, search, limit)
                : readModelRepository.findAfter(facilityId, afterId, search, limit);

        boolean hasMore = rows.size() > pageSize;
        if (hasMore) {
            rows = rows.subList(0, pageSize);
        }
        List<PrepHtsPatientDto> dtos = rows.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        Long nextCursor = (hasMore && !dtos.isEmpty())
                ? dtos.get(dtos.size() - 1).getPersonId()
                : null;
        return KeysetPage.<PrepHtsPatientDto>builder()
                .content(dtos)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .build();
    }

    private String normalizeSearch(String searchValue) {
        if (searchValue == null) return null;
        String v = searchValue.trim();
        if (v.isEmpty() || "*".equals(v) || "null".equalsIgnoreCase(v)) return null;
        return "%" + v.replaceAll("\\s", "") + "%";
    }

    private PrepPepEnrolledReadModel toEntity(PrepHtsPatient r, Long facilityId) {
        return PrepPepEnrolledReadModel.builder()
                .facilityId(facilityId)
                .personId(r.getPersonId())
                .personUuid(r.getPersonUuid())
                .firstName(r.getFirstName())
                .surname(r.getSurname())
                .otherName(r.getOtherName())
                .hospitalNumber(r.getHospitalNumber())
                .age(r.getAge())
                .gender(r.getGender())
                .dateOfBirth(r.getDateOfBirth())
                .prepCount(r.getPrepCount())
                .prepStatus(r.getPrepStatus())
                .eligibilityCount(r.getEligibilityCount())
                .enrollmentCount(r.getEnrollmentCount())
                .dateOfRegistration(r.getDateOfRegistration())
                .phoneNumber(r.getPhoneNumber())
                .address(r.getAddress())
                .previousProphylaxis(r.getPreviousProphylaxis())
                .sendCabLaAlert(r.getSendCabLaAlert())
                .pregnancyStatusDisplay(r.getPregnancyStatusDisplay())
                .isInterrupted(r.getIsInterrupted())
                .pepOnly(r.getPepOnly())
                .htsClientCode(r.getHtsClientCode())
                .htsId(r.getLatestHtsId())
                .htsUuid(r.getLatestHtsUuid())
                .htsPatientId(r.getLatestHtsPatientId())
                .htsPatientUuid(r.getLatestHtsPatientUuid())
                .htsDateOfVisit(r.getLatestHtsDateOfVisit())
                .htsSetting(r.getLatestHtsSetting())
                .htsObservation(r.getLatestHtsObservation())
                .htsFacilityId(r.getLatestHtsFacilityId())
                .dateRefreshed(LocalDateTime.now())
                .build();
    }

    private PrepHtsPatientDto toDto(PrepPepEnrolledReadModel e) {
        return PrepHtsPatientDto.builder()
                .personId(e.getPersonId())
                .personUuid(e.getPersonUuid())
                .firstName(e.getFirstName())
                .surname(e.getSurname())
                .otherName(e.getOtherName())
                .hospitalNumber(e.getHospitalNumber())
                .age(e.getAge())
                .gender(e.getGender())
                .dateOfBirth(e.getDateOfBirth())
                .prepCount(e.getPrepCount())
                .prepStatus(e.getPrepStatus())
                .eligibilityCount(e.getEligibilityCount())
                .enrollmentCount(e.getEnrollmentCount())
                .dateOfRegistration(e.getDateOfRegistration())
                .phoneNumber(e.getPhoneNumber())
                .address(e.getAddress())
                .previousProphylaxis(e.getPreviousProphylaxis())
                .sendCabLaAlert(e.getSendCabLaAlert())
                .pregnancyStatusDisplay(e.getPregnancyStatusDisplay())
                .isInterrupted(e.getIsInterrupted())
                .pepOnly(e.getPepOnly())
                .htsClientCode(e.getHtsClientCode())
                .latestHtsResult(toLatestHts(e))
                .build();
    }

    private LatestHtsResultDto toLatestHts(PrepPepEnrolledReadModel e) {
        if (e.getHtsId() == null) return null;
        return LatestHtsResultDto.builder()
                .id(e.getHtsId())
                .uuid(e.getHtsUuid())
                .patientId(e.getHtsPatientId())
                .patientUuid(e.getHtsPatientUuid())
                .clientCode(e.getHtsClientCode())
                .dateOfVisit(e.getHtsDateOfVisit())
                .setting(e.getHtsSetting())
                .observation(parseObservation(e.getHtsObservation()))
                .facilityId(e.getHtsFacilityId())
                .build();
    }

    private JsonNode parseObservation(String text) {
        if (text == null || text.isEmpty()) return null;
        try {
            return objectMapper.readTree(text);
        } catch (Exception ex) {
            return null;
        }
    }
}
