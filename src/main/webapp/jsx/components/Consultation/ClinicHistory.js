import React, { useEffect, useState } from 'react'
import MaterialTable from 'material-table';
import axios from "axios";
import { url as baseUrl } from "./../../../api";
import { token as token } from "./../../../api";
import { forwardRef } from 'react';
import 'semantic-ui-css/semantic.min.css';
import "react-widgets/dist/css/react-widgets.css";
import { toast } from "react-toastify";

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
import 'react-toastify/dist/ReactToastify.css';
import 'react-widgets/dist/css/react-widgets.css';
import { makeStyles } from '@material-ui/core/styles'
//import { useHistory } from "react-router-dom";
//import {Menu,MenuList,MenuButton,MenuItem,} from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { Modal } from "react-bootstrap";
import { Dropdown, Button, Menu, Icon } from 'semantic-ui-react'


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



const PatientnHistory = (props) => {

    const [saving, setSaving] = useState(false)
    const [open, setOpen] = React.useState(false)
    const [record, setRecord] = useState(null)

    const toggle = () => setOpen(prev => !prev);
    useEffect(() => {
        props.getPatientHistory()
        if (props.activeContent.actionType === "view") {
            props.getPatientHistory()
        }
    }, [props.patientObj.id, props.activeContent.actionType]);

    const LoadViewPage = (row, action) => {
        props.setActiveContent({ ...props.activeContent, route: 'consultation', id: row.id, actionType: action, activeTab: 'home' })
    }
    const LoadModal = (row) => {
        toggle()
        setRecord(row)
    }
    const LoadDeletePage = (row) => {
        if (row.path === 'prep-eligibility') {
            setSaving(true)
            axios
                .delete(`${baseUrl}prep-eligibility/${row.id}`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                )
                .then((response) => {
                    setSaving(false)
                    toast.success("Record Deleted Successfully");
                    props.getPatientHistory()
                    toggle()
                })
                .catch((error) => {
                    setSaving(false)
                    if (error.response && error.response.data) {
                        let errorMessage = error.response.data.apierror && error.response.data.apierror.message !== "" ? error.response.data.apierror.message : "Something went wrong, please try again";
                        toast.error(errorMessage);
                    }
                    else {
                        toast.error("Something went wrong. Please try again...");
                    }
                });
        } else if (row.path === 'prep-clinic') {
            setSaving(true)
            axios
                .delete(`${baseUrl}prep-clinic/${row.id}`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                )
                .then((response) => {
                    setSaving(false)
                    toast.success("Record Deleted Successfully");
                    props.getPatientHistory()
                    props.setActiveContent({...props.activeContent, route:'recent-history'})
                    toggle()
                })
                .catch((error) => {
                    setSaving(false)
                    if (error.response && error.response.data) {
                        let errorMessage = error.response.data.apierror && error.response.data.apierror.message !== "" ? error.response.data.apierror.message : "Something went wrong, please try again";
                        toast.error(errorMessage);
                    }
                    else {
                        toast.error("Something went wrong. Please try again...");
                    }
                });

        } else if (row.path === 'prep-enrollment') {
            setSaving(true)
            //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
            axios
                .delete(`${baseUrl}prep-enrollment/${row.id}`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                )
                .then((response) => {
                    setSaving(false)
                    toast.success("Record Deleted Successfully");
                    props.getPatientHistory()
                    toggle()
                })
                .catch((error) => {
                    setSaving(false)
                    if (error.response && error.response.data) {
                        let errorMessage = error.response.data.apierror && error.response.data.apierror.message !== "" ? error.response.data.apierror.message : "Something went wrong, please try again";
                        toast.error(errorMessage);
                    }
                    else {
                        toast.error("Something went wrong. Please try again...");
                    }
                });

        } else if (row.path === 'prep-enrollment2') {
            setSaving(true)
            axios
                .delete(`${baseUrl}prep-enrollment/${row.id}`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                )
                .then((response) => {
                    setSaving(false)
                    toast.success("Record Deleted Successfully");
                    props.getPatientHistory()
                    toggle()
                })
                .catch((error) => {
                    setSaving(false)
                    if (error.response && error.response.data) {
                        let errorMessage = error.response.data.apierror && error.response.data.apierror.message !== "" ? error.response.data.apierror.message : "Something went wrong, please try again";
                        toast.error(errorMessage);
                    }
                    else {
                        toast.error("Something went wrong. Please try again...");
                    }
                });

        } else {

        }

    }

    return (
        <div>

            <br />

            <MaterialTable
                icons={tableIcons}
                title="Patient Clinic Visit History"
                columns={[
                    { title: "Visit Date", field: "date" },
                    {
                        title: "Regimen Given",
                        field: "regimen",
                    },
                    { title: "Next Appointment", field: "nextAppointment", filtering: false },
                    { title: "Actions", field: "actions", filtering: false },
                ]}
                isLoading={props.loading}
                data={props.recentActivities && props.recentActivities.map((row) => ({
                    date: row.encounterDate,
                    regimen: row.regimen,
                    nextAppointment: row.nextAppointment,
                    actions:

                        <div>
                            <Menu.Menu position='right'  >
                                <Menu.Item >
                                    <Button style={{ backgroundColor: 'rgb(153,46,98)' }} primary>
                                        <Dropdown item text='Action'>

                                            <Dropdown.Menu style={{ marginTop: "10px", }}>
                                                <Dropdown.Item onClick={() => LoadViewPage(row, 'view')}> <Icon name='eye' />View</Dropdown.Item>
                                                <Dropdown.Item onClick={() => LoadViewPage(row, 'update')}><Icon name='edit' />Edit</Dropdown.Item>
                                                <Dropdown.Item onClick={() => LoadModal(row)}> <Icon name='trash' /> Delete</Dropdown.Item>
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
                        width: '200%',
                        margingLeft: '250px',
                    },
                    filtering: false,
                    exportButton: false,
                    searchFieldAlignment: 'left',
                    pageSizeOptions: [10, 20, 100],
                    pageSize: 10,
                    debounceInterval: 400
                }}
            />
            <Modal show={open} toggle={toggle} className="fade" size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered backdrop="static">
                <Modal.Header >
                    <Modal.Title id="contained-modal-title-vcenter">
                        Notification!
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Are you Sure you want to delete <b>{record && record.name}</b></h4>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => LoadDeletePage({ ...record, path: "prep-clinic" })} style={{ backgroundColor: "red", color: "#fff" }} disabled={saving}>{saving === false ? "Yes" : "Deleting..."}</Button>
                    <Button onClick={toggle} style={{ backgroundColor: "#014d88", color: "#fff" }} disabled={saving}>No</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PatientnHistory;


