package org.lamisplus.modules.prep.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * User-facing error messages for the PrEP module. Each helper throws
 * {@link ResponseStatusException} so the response body carries the message
 * verbatim ({@code response.data.message}) without the
 * {@code "ClassName already exist {field=value}"} auto-format produced by
 * the framework's {@code RecordExistException}.
 *
 * <p>All messages here read like a clinician's notification: tell the user
 * what specifically failed and what they can do about it.
 */
public final class PrepErrors {

    private static final DateTimeFormatter HUMAN_DATE = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private PrepErrors() {}

    private static String fmt(LocalDate date) {
        return date == null ? "the selected date" : date.format(HUMAN_DATE);
    }

    // ── Duplicate-by-date ──────────────────────────────────────────────────

    public static ResponseStatusException screeningAlreadyExists(LocalDate visitDate) {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "A PrEP/PEP eligibility screening has already been recorded for this client on "
                        + fmt(visitDate) + ". Pick a different visit date or update the existing record.");
    }

    public static ResponseStatusException initiationAlreadyExistsForScreening() {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "This eligibility screening has already been used to initiate the client. "
                        + "Create a new eligibility screening before initiating again.");
    }

    public static ResponseStatusException initiationVisitAlreadyExists(LocalDate dateEnrolled) {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "An initiation has already been recorded for this client on "
                        + fmt(dateEnrolled) + ". Update the existing initiation instead of creating a new one.");
    }

    public static ResponseStatusException commencementAlreadyExists(LocalDate encounterDate) {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "A commencement visit has already been recorded for this client on "
                        + fmt(encounterDate) + ".");
    }

    public static ResponseStatusException clinicVisitAlreadyExists(LocalDate encounterDate) {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "A clinic visit has already been recorded for this client on "
                        + fmt(encounterDate) + ". Update that visit instead of creating a new one.");
    }

    public static ResponseStatusException followupVisitAlreadyExists(LocalDate encounterDate) {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "A follow-up visit has already been recorded for this client on "
                        + fmt(encounterDate) + ". Update that visit instead of creating a new one.");
    }

    public static ResponseStatusException pepFollowupAlreadyExists(LocalDate encounterDate) {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "A PEP follow-up visit has already been recorded for this client on "
                        + fmt(encounterDate) + ".");
    }

    public static ResponseStatusException interruptionAlreadyExists(LocalDate interruptionDate) {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "A discontinuation / interruption has already been recorded for this client on "
                        + fmt(interruptionDate) + ". If you need to amend it, edit the existing record.");
    }

    // ── Cross-record consistency ───────────────────────────────────────────

    public static ResponseStatusException personMismatch(String what) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "This " + what + " is linked to a different client. Refresh the page and try again.");
    }

    public static ResponseStatusException invalidProphylaxisInitiation() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "This visit is not linked to a valid PrEP initiation. Initiate the client on PrEP "
                        + "before recording a follow-up visit.");
    }

    public static ResponseStatusException enrollmentHasDependentRecords(String childRecord) {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "This enrollment cannot be removed because there is already a " + childRecord
                        + " linked to it. Delete the " + childRecord + " first.");
    }

    public static ResponseStatusException eligibilityHasDependentInitiation() {
        return new ResponseStatusException(HttpStatus.CONFLICT,
                "This eligibility screening cannot be removed because an initiation has already been "
                        + "created from it. Delete the initiation first.");
    }

    // ── Not found ──────────────────────────────────────────────────────────

    public static ResponseStatusException notFound(String what) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND,
                "We couldn't find the requested " + what + ". It may have been removed by another user.");
    }

    public static ResponseStatusException clientNotFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND,
                "We couldn't find this client's record. They may have been removed or transferred.");
    }

    // ── Clinical guard rails ───────────────────────────────────────────────

    public static ResponseStatusException prepBelowMinimumAge(int minimumAge) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "PrEP is only available for clients aged " + minimumAge + " and above. "
                        + "Initiate this client on PEP instead.");
    }

    // ── PEP follow-up HTS ordering ─────────────────────────────────────────

    public static ResponseStatusException htsNotAfterInitiation(LocalDate initiationDate) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "The selected HTS result must be dated later than the PEP initiation ("
                        + fmt(initiationDate) + "). A follow-up visit happens after initiation — "
                        + "please register a new HTS with a later date and select it.");
    }

    public static ResponseStatusException htsNotAfterPreviousVisit(LocalDate previousHtsDate) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "The selected HTS result must be dated later than the previous follow-up visit's "
                        + "HTS result (" + fmt(previousHtsDate) + "). Please register a new HTS with a "
                        + "later date and select it.");
    }
}
