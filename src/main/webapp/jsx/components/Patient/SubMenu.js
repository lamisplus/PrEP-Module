import React, { useState, useEffect } from "react";
import { Menu } from "semantic-ui-react";




function SubMenu(props) {

    const patientObj = props.patientDetail 
    useEffect(() => {
        //Observation();
    }, [props.patientObj]);

    const loadPrEPDiscontinuationsInterruptions = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-interruptions'})
    }
    const loadPrEPRegistrationForm = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-registration'})
    }
    const loadPrEPCommencementForm = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-commencement'})
    }
    const loadPrEPEligibiltyScreeningForm = (row) =>{
        props.setActiveContent({...props.activeContent, route:'prep-screening'})
    }

    const onClickConsultation = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'consultation'})
    }
    const onClickHome = (row) =>{        
        props.setActiveContent({...props.activeContent, route:'recent-history'})
    }
    const loadPatientHistory = ()=>{
        props.setActiveContent({...props.activeContent, route:'patient-history'})
    }


    return (
         <div>
            {patientObj && patientObj!==null ? (<>
                <Menu size="mini" color={"black"} inverted >
                <Menu.Item onClick={() => onClickHome()} > Home</Menu.Item>                  
                {patientObj.prepEligibilityCount<=0 || patientObj.prepEnrollmentCount<=0 || patientObj.commenced!==true ? 
                (<>
                    {patientObj.prepEligibilityCount <=0 && (<Menu.Item onClick={() => loadPrEPEligibiltyScreeningForm()} >PrEP Eligibilty Screening Form</Menu.Item>)}
                    {patientObj.prepEligibilityCount >0 && patientObj.prepEnrollmentCount<=0 && (<Menu.Item onClick={() => loadPrEPRegistrationForm()} >PrEP Enrollment</Menu.Item>)}
                    {patientObj.prepEligibilityCount >0 && patientObj.prepEnrollmentCount>0 && patientObj.commenced!==true && (<Menu.Item onClick={() => loadPrEPCommencementForm()} >PrEP Commencement</Menu.Item>)}
                </>)
                :
                (<>  
                    <Menu.Item onClick={() => onClickConsultation()} > PrEP Visit</Menu.Item>
                    <Menu.Item onClick={() => loadPrEPDiscontinuationsInterruptions()} >PrEP Discontinuations & Interruptions</Menu.Item>
                </>)}
                <Menu.Item onClick={() => loadPatientHistory(patientObj)} >History</Menu.Item>                    
                </Menu>
            </>)
            :
            (
            <>
            </>
            )
            }
                         
        </div>
    );
}



export default SubMenu;
