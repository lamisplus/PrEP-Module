import React, { useEffect, useState } from "react";
import axios from "axios";
import MaterialTable, { MTableToolbar } from "material-table";
import { token as token, url as baseUrl } from "./../../../api";
import { forwardRef } from "react";
import "semantic-ui-css/semantic.min.css";
import { Link } from "react-router-dom";
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
import { MdDashboard } from "react-icons/md";
import "@reach/menu-button/styles.css";
import { Label } from "semantic-ui-react";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
import moment from "moment";

//Dtate Picker package
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

const Patients = (props) => {
  const [patientList, setPatientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPPI, setShowPPI] = useState(true);
  const [query, setQuery] = useState({ pageSize: 10, page: 0, search: "" });

  useEffect(() => {
    fetchPatients(query);
  }, []);

  const fetchPatients = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}prep/persons?pageSize=${query.pageSize}&pageNo=${query.page}&searchValue=${query.search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatientList(response.data.records);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleCheckBox = (e) => {
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
          {
            title: "Patient Name",
            field: "name",
            hidden: showPPI,
          },
          {
            title: "Hospital Number",
            field: "hospital_number",
            filtering: false,
          },
          { title: "PrEP Code", field: "clientCode", filtering: false },
          { title: "Sex", field: "gender", filtering: false },
          { title: "Age", field: "age", filtering: false },
          { title: "PrEP Status", field: "status", filtering: false },
          { title: "Actions", field: "actions", filtering: false },
        ]}
        data={patientList.map((row) => ({
          name: row.firstName + " " + row.surname,
          hospital_number: row.hospitalNumber,
          clientCode: row.uniqueId,
          gender: row && row.gender ? row.gender : "",
          age: row.age,
          status: (
            <Label color="blue" size="mini">
              {row.prepStatus}
            </Label>
          ),
          actions: (
            <div>
              <Link
                to={{
                  pathname: "/patient-dashboard",
                  state: { patientObj: row },
                }}
              >
                <ButtonGroup
                  variant="contained"
                  aria-label="split button"
                  style={{
                    backgroundColor: "rgb(153, 46, 98)",
                    height: "30px",
                    width: "215px",
                  }}
                  size="large"
                >
                  <Button
                    color="primary"
                    size="small"
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    style={{ backgroundColor: "rgb(153, 46, 98)" }}
                  >
                    <MdDashboard />
                  </Button>
                  <Button style={{ backgroundColor: "rgb(153, 46, 98)" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#fff",
                        fontWeight: "bolder",
                      }}
                    >
                      Patient Dashboard
                    </span>
                  </Button>
                </ButtonGroup>
              </Link>
            </div>
          ),
        }))}
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
          exportButton: true,
          searchFieldAlignment: "left",
          pageSizeOptions: [10, 20, 100],
          pageSize: 10,
          debounceInterval: 400,
        }}
        components={{
          Toolbar: (props) => (
            <div className="p-2">
              <div className="form-check custom-checkbox  float-left mt-4 ml-3">
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
                    SHOW PII
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