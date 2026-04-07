import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import MaterialTable, { MTableToolbar } from "material-table";
import { token as token, url as baseUrl } from "./../../../api";
import { forwardRef } from "react";
import "semantic-ui-css/semantic.min.css";
import { useHistory } from "react-router-dom";
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
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Popper from "@material-ui/core/Popper";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import "@reach/menu-button/styles.css";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";

Moment.locale("en");
momentLocalizer();

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

const useStyles = makeStyles({
  statusLabel: {
    width: "150px",
    display: "inline-block",
    textAlign: "center",
  },
});

const EnrollPatientButton = ({ row }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const history = useHistory();

  const handleToggle = event => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleEnroll = screeningType => {
    setOpen(false);
    history.push({
      pathname: "/patient-dashboard",
      state: { patientObj: row, screeningType },
    });
  };

  const canScreenForPrep = row.canScreenForPrep !== false;
  const canScreenForPep = row.canScreenForPep !== false;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <ButtonGroup
        variant="contained"
        size="small"
        ref={anchorRef}
        aria-label="enroll patient button group"
        style={{ height: "30px" }}
      >
        <Button
          style={{
            backgroundColor: "rgb(153, 46, 98)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: "bolder",
            textTransform: "none",
            borderRight: "1px solid rgba(255,255,255,0.3)",
            pointerEvents: "none",
          }}
          startIcon={<PersonAddIcon style={{ fontSize: "16px" }} />}
        >
          Enroll Patient
        </Button>
        <Button
          style={{
            backgroundColor: "rgb(153, 46, 98)",
            color: "#fff",
            minWidth: "30px",
            padding: "0 4px",
          }}
          onClick={handleToggle}
          aria-controls={open ? "enroll-menu-list" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="menu"
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        placement="bottom-end"
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="enroll-menu-list" autoFocusItem>
                  <MenuItem
                    onClick={() => handleEnroll("PrEP")}
                    // disabled={!canScreenForPrep}
                  >
                    PrEP
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleEnroll("PEP")}
                    // disabled={!canScreenForPep}
                  >
                    PEP
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

const Patients = props => {
  const classes = useStyles();
  const [patientList, setPatientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPPI, setShowPPI] = useState(true);

  useEffect(() => {
    patients();
  }, []);

  async function patients() {
    setLoading(true);
    axios
      .get(`${baseUrl}prep/persons`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setLoading(false);
        setPatientList(response.data);
      })
      .catch(error => {
        setLoading(false);
      });
  }

  const handleCheckBox = e => {
    if (e.target.checked) {
      setShowPPI(false);
    } else {
      setShowPPI(true);
    }
  };

  return (
    <div>
      <MaterialTable
        icons={tableIcons}
        title="Find Patient"
        columns={[
          { title: "Patient Name", field: "name", hidden: showPPI },
          {
            title: "Hospital Number",
            field: "hospital_number",
            filtering: false,
          },
          { title: "Sex", field: "gender", filtering: false },
          { title: "Age", field: "age", filtering: false },
          { title: "Actions", field: "actions", filtering: false },
        ]}
        data={query =>
          new Promise((resolve, reject) => {
            axios
              .get(
                `${baseUrl}prep/persons?pageSize=${query.pageSize}&pageNo=${query.page}&searchValue=${query.search}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .then(response => response)
              .then(result => {
                resolve({
                  data: result?.data?.records?.map?.(row => ({
                    name: row.firstName + " " + row.surname,
                    hospital_number: row.hospitalNumber,
                    gender: row && row.gender ? row.gender : "",
                    age: row.age,
                    actions: <EnrollPatientButton row={row} />,
                  })),
                  page: query.page,
                  totalCount: result.data.totalRecords,
                });
              });
          })
        }
        options={{
          headerStyle: {
            backgroundColor: "#014d88",
            color: "#fff",
          },
          searchFieldStyle: {
            width: "100%",
            margingLeft: "250px",
          },
          filtering: false,
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 10,
          debounceInterval: 400,
        }}
        components={{
          Toolbar: props => (
            <div className="p-2">
              <div className="form-check custom-checkbox float-left mt-4 ml-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="showPP!"
                  id="showPP"
                  value="showPP"
                  checked={showPPI === true ? false : true}
                  onChange={handleCheckBox}
                  style={{
                    border: "1px solid #014D88",
                    borderRadius: "0.25rem",
                  }}
                />
                <label className="form-check-label" htmlFor="basic_checkbox_1">
                  <b style={{ color: "#014d88", fontWeight: "bold" }}>
                    {" "}
                    SHOW PII{" "}
                  </b>
                </label>
              </div>
              <MTableToolbar {...props} />
            </div>
          ),
        }}
      />
    </div>
  );
};

export default Patients;
