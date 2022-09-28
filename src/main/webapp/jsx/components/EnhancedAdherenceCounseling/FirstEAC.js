import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles'
import axios from "axios";
import { toast} from "react-toastify";
import { url as baseUrl } from "../../../api";
import { token as token } from "../../../api";
import "react-widgets/dist/css/react-widgets.css";
import FirstEAC from './EnhancedAdherenceCounseling';
import SecondEac from './SecondEac';
import ThirdEac from './ThirdEac';

const useStyles = makeStyles(theme => ({
    card: {
        margin: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    cardBottom: {
        marginBottom: 20
    },
    Select: {
        height: 45,
        width: 350
    },
    button: {
        margin: theme.spacing(1)
    },

    root: {
        '& > *': {
            margin: theme.spacing(1)
        }
    },
    input: {
        display: 'none'
    } 
}))

const EAC = (props) => {
    const patientObj = props.patientObj;
    const classes = useStyles()
    const [eacList, setEacList] = useState([])
    const [eacObj, setEacObj] = useState([])
    const [hideFirst, setHideFirst] = useState(false)
    const [hideSecond, setHideSecond] = useState(false)
    const [hideThird, setHideThird] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        EAC()
      }, [props.patientObj.id]);
    //GET LIST OF EAC
    async function EAC() {
        setLoading(true)
        axios
            .get(`${baseUrl}observation/eac/person/${props.patientObj.id}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                setLoading(false)
                setEacList(response.data); 
                setEacObj(response.data) 
                const responseObj = response.data.filter((x)=> x.status !=='Completed') 
                if(responseObj<1) {
                    setHideFirst(false)
                    setHideSecond(false)
                    setHideThird(false)
                }else if(responseObj[0].status==='First'){
                    setHideFirst(true)
                    setHideSecond(true)
                    setHideThird(false)
                }else if(responseObj[0].status==='Second'){
                    setHideFirst(true)
                    setHideSecond(false)
                    setHideThird(true)
                } else if(responseObj[0].status==='Completed'){
                    setHideFirst(true)
                    setHideSecond(false)
                    setHideThird(false)
                }            
            })
            .catch((error) => {  
                setLoading(false)  
            });        
    }

  return (      
        <div> 

                    {!hideFirst && (<FirstEAC patientObj={patientObj} setEacObj={setEacObj} setHideFirst={setHideFirst} setHideSecond={setHideSecond} setActiveContent={props.setActiveContent}/>)} 
               
                    {hideSecond && (<SecondEac patientObj={patientObj} setEacObj={setEacObj} setHideSecond={setHideSecond} setHideThird={setHideThird} setActiveContent={props.setActiveContent}/> )} 
                    {hideThird && (<ThirdEac patientObj={patientObj} setEacObj={setEacObj} setHideFirst={setHideFirst} setHideThird={setHideThird} setActiveContent={props.setActiveContent}/> )}                  
                          
        </div>
  );
}

export default EAC;
