import React, { useEffect, useRef, useState } from "react";
import MaterialTable from "material-table";
import axios from "axios";
import { extractErrorMessage } from "../../../Utils/extractErrorMessage";
import { url as baseUrl } from "./../../../api";
import { token as token } from "./../../../api";
import { forwardRef } from "react";
import "semantic-ui-css/semantic.min.css";
import "react-widgets/dist/css/react-widgets.css";
import { toast } from "react-toastify";

import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import "react-toastify/dist/ReactToastify.css";
import "react-widgets/dist/css/react-widgets.css";
import { makeStyles } from "@material-ui/core/styles";
import MuiButton from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
//import { useHistory } from "react-router-dom";
//import {Menu,MenuList,MenuButton,MenuItem,} from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { Modal } from "react-bootstrap";
import { Dropdown, Button, Menu, Icon } from "semantic-ui-react";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const splitBtnStyle = {
  backgroundColor: "rgb(153, 46, 98)",
  color: "#fff",
  minWidth: 0,
  height: "2.2rem",
  lineHeight: 1,
  border: "none",
  boxShadow: "none",
  textTransform: "uppercase",
  fontFamily: "inherit",
  fontWeight: "bold",
  letterSpacing: "0.05em",
};

const ActionButton = ({ row, onView, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => setMenuOpen(p => !p);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <ButtonGroup variant="contained" size="small" style={{ height: "2.2rem", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.2)" }}>
        <MuiButton onClick={toggle} style={{ ...splitBtnStyle, fontSize: "0.8rem", paddingLeft: "0.875rem", paddingRight: "0.75rem" }}>
          Action
        </MuiButton>
        <MuiButton onClick={toggle} style={{ ...splitBtnStyle, borderLeft: "0.0625rem solid rgba(255,255,255,0.35)", minWidth: "2.25rem", fontSize: "1.4rem", paddingLeft: "0.375rem", paddingRight: "0.375rem" }}>
          ▾
        </MuiButton>
      </ButtonGroup>
      {menuOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 9999, background: "#fff", boxShadow: "0 0.125rem 0.5rem rgba(0,0,0,0.18)", borderRadius: "0.25rem", width: "100%", marginTop: "0.25rem" }}>
          {row.viewable && (
            <div onClick={() => { setMenuOpen(false); onView(row); }}
              style={{ padding: "0.5rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <Icon name="eye" /> View
            </div>
          )}
          {row.editable && (
            <div onClick={() => { setMenuOpen(false); onEdit(row); }}
              style={{ padding: "0.5rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <Icon name="edit" /> Edit
            </div>
          )}
          <div onClick={() => { setMenuOpen(false); onDelete(row); }}
            style={{ padding: "0.5rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <Icon name="trash" /> Delete
          </div>
        </div>
      )}
    </div>
  );
};

const PatientnHistory = props => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [record, setRecord] = useState(null);
  const toggle = () => setOpen(!open);
  useEffect(() => {
    PatientHistory();
  }, [props.patientObj.id]);
  ///GET LIST OF Patients
  const PatientHistory = () => {
    setLoading(true);
    axios
      .get(
        `${baseUrl}prep/general-activities/patients/${
          props.patientObj.personId || props.patientObj.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setLoading(false);
        setRecentActivities(response.data);
      })

      .catch(error => {
        //console.log(error);
      });
  };

  const LoadViewPage = (row, action) => {
    if (row.path === "prep-eligibility-screening") {
      props.setActiveContent({
        ...props.activeContent,
        route: "prep-screening",
        id: row.id,
        actionType: action,
      });
    } else if (row.path === "prep-pep-initiation") {
      props.setActiveContent({
        ...props.activeContent,
        route: "prep-registration",
        id: row.id,
        actionType: action,
      });
    } else if (row.path === "prep-followup-visit" || row.path === "prep-commencement") {
      // Legacy "PrEP Commencement" records live in the same prep_followup_visit
      // table as regular follow-up visits (the standalone commencement form was
      // removed). Route both to the consultation (PrEP follow-up) view so old
      // commencement records can still be viewed/edited instead of rendering a
      // missing component.
      props.setActiveContent({
        ...props.activeContent,
        route: "consultation",
        recentActivities,
        id: row.id,
        actionType: action,
      });
    } else if (row.path === "prep-completion") {
      props.setActiveContent({
        ...props.activeContent,
        route: "prep-interruptions",
        id: row.id,
        actionType: action,
      });
    } else {
    }
  };
  const LoadModal = row => {
    toggle();
    setRecord(row);
  };
  const LoadDeletePage = row => {
    if (row.path === "prep-eligibility-screening") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'mental-health-view', id:row.id})
      axios
        .delete(`${baseUrl}prep-eligibility-screening/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          PatientHistory();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "prep-followup-visit") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}prep-followup-visit/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          PatientHistory();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "prep-pep-initiation") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}prep-pep-initiation/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          PatientHistory();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "prep-commencement") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}prep-followup-visit/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          PatientHistory();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else if (row.path === "prep-completion") {
      setSaving(true);
      //props.setActiveContent({...props.activeContent, route:'art-commencement-view', id:row.id})
      axios
        .delete(`${baseUrl}prep-completion/${row.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(response => {
          setSaving(false);
          toast.success("Record Deleted Successfully");
          PatientHistory();
          toggle();
        })
        .catch(error => {
          setSaving(false);
          toast.error(extractErrorMessage(error));
        });
    } else {
    }
  };

  return (
    <div>
      <br />

      <MaterialTable
        icons={tableIcons}
        title="Patient History "
        columns={[
          { title: "Name", field: "name" },
          {
            title: "Encounter Date",
            field: "date",
          },
          // { title: "Status", field: "status", filtering: false },
          { title: "Actions", field: "actions", filtering: false },
        ]}
        isLoading={loading}
        data={
          recentActivities &&
          recentActivities.map(row => ({
            name: row.name,
            date: row.date,
            actions: (
              <ActionButton
                row={row}
                onView={r => LoadViewPage(r, "view")}
                onEdit={r => LoadViewPage(r, "update")}
                onDelete={r => LoadModal(r, "delete")}
              />
            ),
          }))
        }
        options={{
          headerStyle: {
            backgroundColor: "#014d88",
            color: "#fff",
          },
          searchFieldStyle: {
            width: "200%",
            margingLeft: "250px",
          },
          filtering: false,
          exportButton: false,
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 10,
          debounceInterval: 400,
        }}
      />
      <Modal
        show={open}
        toggle={toggle}
        className="fade"
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Notification!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>
            Are you Sure you want to delete <b>{record && record.name}</b>
          </h4>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => LoadDeletePage(record)}
            style={{ backgroundColor: "red", color: "#fff" }}
            disabled={saving}
          >
            {saving === false ? "Yes" : "Deleting..."}
          </Button>
          <Button
            onClick={toggle}
            style={{ backgroundColor: "#014d88", color: "#fff" }}
            disabled={saving}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PatientnHistory;
