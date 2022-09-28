package org.lamisplus.modules.hiv.repositories;

import org.lamisplus.modules.hiv.domain.dto.LabEacInfo;
import org.lamisplus.modules.hiv.domain.entity.HIVEac;
import org.lamisplus.modules.patient.domain.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface HIVEacRepository extends JpaRepository<HIVEac, Long> {
	List<HIVEac> getAllByPersonAndArchived(Person person, Integer archived);
	Optional<HIVEac>  getHIVEacByPersonAndLabNumber(Person person, String labNumber);
	
	
	@Query(value = "select * from\n" +
			"    (\n" +
			"        select a.patient_id as patientId\n" +
			"             , b.id as testResltId\n" +
			"             , d.group_name as testGroup\n" +
			"             , c.lab_test_name as testName\n" +
			"             , a.lab_number as labNumber\n" +
			"             , b.date_result_reported resultDate\n" +
			"             ,CAST(b.result_reported as int) as  result\n" +
			"        from laboratory_test a\n" +
			"                 inner join laboratory_result b on a.id=b.test_id\n" +
			"                 inner join laboratory_labtest c on a.lab_test_id=c.id\n" +
			"                 inner join laboratory_labtestgroup d on a.lab_test_group_id=d.id\n" +
			"        where c.lab_test_name = 'Viral Load'\n" +
			"    ) a where result > 1000 and a.patientId = ?1 ", nativeQuery = true)
	List<LabEacInfo> getPatientAllEacs(Long personId);
	
}
