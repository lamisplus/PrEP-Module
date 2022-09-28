package org.lamisplus.modules.hiv.domain.entity;

import lombok.*;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "hiv_status_tracker")
@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(of = "id")
public class HIVStatusTracker extends HivAuditEntity implements Persistable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "hiv_status", nullable = false)
    @NonNull
    private String hivStatus;

    @PastOrPresent
    @Column(name = "status_date", nullable = false)
    @NotNull
    private LocalDate statusDate;
    @ManyToOne
    @JoinColumn(name = "person_id", referencedColumnName = "uuid", nullable = false)
    private Person person;
    @ManyToOne
    @JoinColumn(name = "visit_id", referencedColumnName = "uuid", nullable = false)
    private Visit visit;

    @Column(name = "tracking_outcome")
    private String trackOutcome;

    @PastOrPresent
    @Column(name = "track_date")
    private LocalDate trackDate;

    @Column(name = "agreed_date")
    private LocalDate agreedDate;

    @Size(max = 100)
    @Column(name = "reason_for_interruption")
    private String reasonForInterruption;

    @Size(max = 100)
    @Column(name = "CAUSE_OF_DEATH")
    private String causeOfDeath;

    private Boolean auto = false;

    private String uuid;

    @Basic
    @Column(name = "archived")
    private int archived;

    @Override
    public boolean isNew() {
        return id == null;
    }


}
