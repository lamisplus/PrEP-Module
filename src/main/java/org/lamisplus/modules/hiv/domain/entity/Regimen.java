package org.lamisplus.modules.hiv.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "hiv_regimen")
@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Regimen implements Serializable, Comparable<Regimen>, Persistable<Long> {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    private Long id;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "description")
    private String description;

    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "composition")
    private String composition;

    private Boolean active = true;

    private Integer priority = 1;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "regimen")
    @JsonIgnore
    private List<RegimenDrug> regimenDrugs;

    @JoinColumn(name = "regimen_type_id")
    @ManyToOne(optional = false)
    private RegimenType regimenType;

//    @ManyToOne
//    @JoinColumn(name = "art_pharmacy_id")
//    private ArtPharmacy artPharmacy;

    @Override
    public int compareTo(Regimen o) {
        return description.compareTo(o.description);
    }

    @Override
    public boolean isNew() {
        return id == null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Regimen)) return false;
        Regimen regimen = (Regimen) o;
        return Objects.equals(getId(), regimen.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId());
    }
}
