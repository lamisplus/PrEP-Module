import React, { useEffect, useState } from 'react'
import MaterialTable from 'material-table';
import axios from "axios";
import "react-widgets/dist/css/react-widgets.css";
import { toast} from "react-toastify";
import { token as token, url as baseUrl } from "./../../../api";
import { forwardRef } from 'react';
import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-widgets/dist/css/react-widgets.css';
import { makeStyles } from '@material-ui/core/styles'
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { MdEditNote } from "react-icons/md";
import "@reach/menu-button/styles.css";
import 'semantic-ui-css/semantic.min.css';
import { Dropdown,Button, Menu, Icon } from 'semantic-ui-react'

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';




const tableIcons = {
Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

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
    },
    error: {
        color: "#f85032",
        fontSize: "11px",
    },
    success: {
        color: "#4BB543 ",
        fontSize: "11px",
    }, 
}))


const PharmacyHistory = (props) => {    
    const [refillList, setRefillList] = useState([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        PharmacyList()
      }, [props.patientObj.id]);
    //GET LIST Drug Refill
    async function PharmacyList() {
        setLoading(true)
        axios
            .get(`${baseUrl}hiv/art/pharmacy/patient?pageNo=0&pageSize=10&personId=${props.patientObj.id}`,
            { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                setLoading(false)
                setRefillList(response.data);                
            })
            .catch((error) => {  
                setLoading(false)  
            });        
    }
    const regimenName =(regimenObj)=> {
      let regimenArr = []
      regimenObj.forEach(function (value, index, array) {       
          regimenArr.push(<li key={index}>{value['name']}</li>)
      })
      return regimenArr; 
      }
    const onClickHome = (row, actionType) =>{  
       // props.setActiveContent({...props.activeContent, route:'pharmacy', activeTab:"hsitory"})
        props.setActiveContent({...props.activeContent, route:'pharmacy-update', id:row.id, activeTab:"history", actionType:actionType, obj:row})
    }
    const LoadDeletePage = (row) =>{ 
        console.log(row) 
        axios.delete(`${baseUrl}art/pharmacy/${row.id}`,
                { headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((response) => {
                toast.success("Record Deleted Successfully");
                PharmacyList()
            })
            .catch((error) => {
                if(error.response && error.response.data){
                    let errorMessage = error.response.data.apierror && error.response.data.apierror.message!=="" ? error.response.data.apierror.message :  "Something went wrong, please try again";
                    toast.error(errorMessage);
                  }
                  else{
                    toast.error("Something went wrong. Please try again...");
                  }
            }); 
     }
    

  return (
    <div>
        
            <br/>
        
            <MaterialTable
            icons={tableIcons}
              title="Pharmacy History"
              columns={[
              // { title: " ID", field: "Id" },
                {
                  title: "Visit Date",
                  field: "visitDate",
                },
                { title: "Refill Period", field: "refillPeriod", filtering: false },
                { title: "Next Appointment", field: "nextAppointment", filtering: false },
                { title: "Regimen Name", field: "regimenName", filtering: false },
               // { title: "Quantity", field: "regimenQuantity", filtering: false },
                { title: "isDevolve", field: "isDevolve", filtering: false },
                { title: "DSDModel", field: "dsdModel", filtering: false },
                { title: "MMD Type", field: "mmdType", filtering: false },
                { title: "Prescription Error", field: "prescriptionError", filtering: false },
                { title: "ADR Screened", field: "adverseDrugReactions", filtering: false },
                { title: "Action", field: "Action", filtering: false },

              ]}
              isLoading={loading}
              data={ refillList.map((row) => ({
                  //Id: manager.id,
                  visitDate:row.visitDate,
                  refillPeriod: row.refillPeriod,
                  nextAppointment: row.nextAppointment,
                  regimenName: (
                                <ul>
                                   {regimenName(row.extra.regimens)}
 
                                </ul>
                    
                                ),  
                 regimenQuantity: "", 
                  isDevolve: row.isDevolve, 
                  mmdType: row.mmdType, 
                  prescriptionError: row.prescriptionError===false? "NO":"YES", 
                  adverseDrugReactions: row.adrScreened===false? "NO":"YES",                   
                  Action:<div>
                            <Menu.Menu position='right'  >
                            <Menu.Item >
                                <Button style={{backgroundColor:'rgb(153,46,98)'}} primary>
                                <Dropdown item text='Action'>

                                <Dropdown.Menu style={{ marginTop:"10px", }}>
                                   <Dropdown.Item  onClick={()=>onClickHome(row, 'update')}><Icon name='edit' />Update</Dropdown.Item>
                                    <Dropdown.Item  onClick={()=>LoadDeletePage(row)}> <Icon name='trash' /> Delete</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                                </Button>
                            </Menu.Item>
                            </Menu.Menu>
                         </div>
                  
                  }))}
            
                        options={{
                          headerStyle: {
                            backgroundColor: "#014d88",
                              color: "#fff",
                          },
                          searchFieldStyle: {
                              width : '200%',
                              margingLeft: '250px',
                          },
                          filtering: false,
                          exportButton: false,
                          searchFieldAlignment: 'left',
                          pageSizeOptions:[10,20,100],
                          pageSize:10,
                          debounceInterval: 400
                      }}
            />
       
    </div>
  );
}

export default PharmacyHistory;


