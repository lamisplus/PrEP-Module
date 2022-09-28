import React from 'react';
import { makeStyles } from '@material-ui/core/styles'
import "react-widgets/dist/css/react-widgets.css";
import AdultClinicEvaluationFrom from './AdultClinicEvaluationFrom';
import ChildClinicEvaluationForm from './ChildClinicEvaluationForm';



const ClinicEvaluation = (props) => {
    const patientObj = props.patientObj;
    const calculate_age = dob => {
        var today = new Date();
        var dateParts = dob.split("-");
        var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
        var birthDate = new Date(dateObject); // create a date object directlyfrom`dob1`argument
        var age_now = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age_now--;
                }
            if (age_now === 0) {
                    return m ;
                }
                return age_now ;
      };
    const age = calculate_age(patientObj.dateOfBirth)

  return (  
        <div>
            { age > 10 ?
                <AdultClinicEvaluationFrom patientObj={patientObj} setActiveContent={props.setActiveContent}/>
                :
                <ChildClinicEvaluationForm patientObj={patientObj} setActiveContent={props.setActiveContent}/>
            }

        </div>
  );
}

export default ClinicEvaluation;
