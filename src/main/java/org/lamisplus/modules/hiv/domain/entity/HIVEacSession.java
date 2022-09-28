package org.lamisplus.modules.hiv.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;
import org.hibernate.annotations.Type;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.lamisplus.modules.patient.domain.entity.Visit;
import org.springframework.data.domain.Persistable;


import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "hiv_eac_session")
@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class HIVEacSession extends HivAuditEntity implements Serializable, Persistable<Long> {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Long id;
	@ManyToOne
	@JoinColumn(name = "eac_id", referencedColumnName = "uuid", nullable = false)
	private  HIVEac eac;
	@ManyToOne
	@JoinColumn(name = "person_uuid", referencedColumnName = "uuid", nullable = false)
	private Person person;
	@ManyToOne
	@JoinColumn(name = "visit_id", referencedColumnName = "uuid", nullable = false)
	private Visit visit;

	@Type(type = "jsonb")
	@Column(columnDefinition = "jsonb")
	private JsonNode barriers;
	@Type(type = "jsonb")
	@Column(columnDefinition = "jsonb")
	private JsonNode intervention;
	private String barriersOthers;
	private String interventionOthers;
	private String comment;
	private LocalDate followUpDate;
	private String referral;
	private String adherence;
	private String status;
	@Column(name = "uuid", nullable = false, unique = true, updatable = false)
	private String uuid;
	private int  archived;
	@Override
	public boolean isNew() {
		return id == null;
	}
}