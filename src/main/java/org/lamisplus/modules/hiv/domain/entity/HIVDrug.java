package org.lamisplus.modules.hiv.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.ToString;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "hiv_drug")
@Data
@ToString(of = "abbrev")
public class HIVDrug implements Serializable, Persistable<Long> {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    private Long id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 45)
    @Column(name = "ABBREV")
    private String abbrev;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "NAME")
    private String name;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 45)
    @Column(name = "STRENGTH")
    private String strength;

    @Basic(optional = false)
    @NotNull
    @Column(name = "PACK_SIZE")
    private int packSize;

    @Size(max = 45)
    @Column(name = "DOSEFORM")
    private String doseForm;

    @Column(name = "MORNING")
    private Integer morning;

    @Column(name = "AFTERNOON")
    private Integer afternoon;

    @Column(name = "EVENING")
    private Integer evening;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "drug")
    @JsonIgnore
    private List<RegimenDrug> regimenDrugs;

    @Override
    public boolean isNew() {
        return id == null;
    }
}