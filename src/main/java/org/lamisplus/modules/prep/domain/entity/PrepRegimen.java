package org.lamisplus.modules.prep.domain.entity;



import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.EqualsAndHashCode;
import javax.persistence.*;
import java.io.Serializable;


@Entity
@Data
@EqualsAndHashCode(callSuper = false)
@Table(name = "prep_regimen")
public class PrepRegimen implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "code")
    private String code;

    @Column(name = "regimen")
    private String regimen;

    @Column(name = "composition")
    private String composition;

    @Column(name = "description")
    private String description;

    @JsonIgnore
    @Column(name = "archived")
    private String archived;
}

