package org.lamisplus.modules.hiv.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.ToString;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "hiv_regimen_drug")
@Data
@ToString(of = "id")
public class RegimenDrug implements Serializable, Persistable<Long> {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    private Long id;

    @JoinColumn(name = "drug_id")
    @ManyToOne(optional = false)
    @JsonIgnore
    private HIVDrug drug;

    @JoinColumn(name = "regimen_id")
    @ManyToOne(optional = false)
    @JsonIgnore
    private Regimen regimen;

    @Override
    public boolean isNew() {
        return id == null;
    }
}
