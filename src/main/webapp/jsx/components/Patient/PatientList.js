import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import MaterialTable, { MTableToolbar } from "material-table";
import { token as token, url as baseUrl } from "./../../../api";
import {
  ENROLLMENT_LABEL_PREP,
  ENROLLMENT_LABEL_PEP,
} from "../../constants/enrollmentType";
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
import MuiButton from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import CloseIcon from "@material-ui/icons/Close";
import { Icon } from "semantic-ui-react";
import "@reach/menu-button/styles.css";
import Moment from "moment";
import momentLocalizer from "react-widgets-moment";
import HtsWarningModal from "../../../Reusables/HtsWarningModal";
import { isValidHtsEncounter } from "../../../Utils/htsEncounter";

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

const enrollSplitBtnStyle = {
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

const ENTRY_POINTS = [
  {
    code: ENROLLMENT_LABEL_PREP,
    label: ENROLLMENT_LABEL_PREP,
    title: "Pre-Exposure Prophylaxis",
    description:
      "Enroll a client at risk of HIV exposure into the PrEP service line.",
    accent: "#014D88",
  },
  {
    code: ENROLLMENT_LABEL_PEP,
    label: ENROLLMENT_LABEL_PEP,
    title: "Post-Exposure Prophylaxis",
    description:
      "Enroll a client following a recent potential HIV exposure into the PEP service line.",
    accent: "#992E62",
  },
];

const EntryPointCard = ({ entry, onSelect, disabled, disabledReason }) => {
  const accent = disabled ? "#9ca3af" : entry.accent;
  const card = (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onSelect(entry.code)}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") onSelect(entry.code);
      }}
      style={{
        flex: "1 1 0",
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: "0.5rem",
        border: `0.125rem solid ${accent}`,
        background: disabled ? "#f3f4f6" : "#fff",
        padding: "1.25rem 1rem",
        textAlign: "center",
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
        outline: "none",
        opacity: disabled ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-0.125rem)";
        e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "3rem",
          height: "3rem",
          borderRadius: "50%",
          background: accent,
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "0.75rem",
        }}
      >
        <Icon name="user plus" style={{ fontSize: "1.25rem", margin: 0 }} />
      </div>
      <div
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: accent,
          marginBottom: "0.25rem",
        }}
      >
        {entry.label}
      </div>
      <div
        style={{ fontSize: "0.85rem", color: "#333", marginBottom: "0.5rem" }}
      >
        {entry.title}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.4 }}>
        {disabled && disabledReason ? disabledReason : entry.description}
      </div>
    </div>
  );
  if (disabled && disabledReason) {
    return (
      <Tooltip title={disabledReason} arrow>
        <div style={{ flex: "1 1 0", display: "flex" }}>{card}</div>
      </Tooltip>
    );
  }
  return card;
};

const EnrollPatientButton = React.memo(({ row }) => {
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [htsWarnOpen, setHtsWarnOpen] = useState(false);
  const htsNeedsRetake = !isValidHtsEncounter(row?.latestHtsResult);
  const blockedArm = row?.isCurrentStatusInterruptedPrep
    ? "PrEP"
    : row?.isCurrentStatusInterruptedPep
    ? "PEP"
    : null;

  const handleOpen = () => {
    if (htsNeedsRetake) {
      setHtsWarnOpen(true);
      return;
    }
    setOpen(true);
  };

  const ageNum = Number(row?.age);
  const prepBlockedByAge = Number.isFinite(ageNum) && ageNum < 15;
  const prepBlockedByEarlyDetect = !!row?.pepOnly;

  const handleEnroll = (screeningType) => {
    if (blockedArm) return;
    if (
      screeningType === ENROLLMENT_LABEL_PREP &&
      (prepBlockedByAge || prepBlockedByEarlyDetect)
    )
      return;
    setOpen(false);
    history.push({
      pathname: "/patient-dashboard",
      state: { patientObj: row, screeningType, freshEnroll: true },
    });
  };

  return (
    <>
      <MuiButton
        onClick={handleOpen}
        variant="contained"
        size="small"
        disableRipple
        style={{
          backgroundColor: "rgb(153, 46, 98)",
          color: "#fff",
          textTransform: "uppercase",
          fontFamily: "inherit",
          fontWeight: "bold",
          letterSpacing: "0.05em",
          fontSize: "0.8rem",
          padding: 0,
          height: "2.2rem",
          minWidth: 0,
          border: "none",
          boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.2)",
          display: "inline-flex",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 0.625rem",
            borderRight: "0.0625rem solid rgba(255,255,255,0.4)",
          }}
        >
          <Icon name="user plus" style={{ margin: 0, fontSize: "0.95rem" }} />
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0 1rem",
            whiteSpace: "nowrap",
          }}
        >
          Enroll Patient
        </span>
      </MuiButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { borderRadius: "0.5rem" } }}
      >
        <DialogTitle
          disableTypography
          style={{
            background: blockedArm ? "#F44336" : "rgb(153, 46, 98)",
            color: "#fff",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 600 }}>
            {blockedArm ? "Active Enrollment" : "Select Enrollment Type"}
          </span>
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            style={{ color: "#fff" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ padding: "1.25rem" }}>
          <>
            {/* One modal for both states: the two entry-point cards always
                  render. When the client is active on an arm we keep the cards
                  visible but disabled and surface a red-orange block notice
                  right below the header, instead of swapping to a separate
                  "Active Enrollment" view. */}
            {blockedArm ? (
              <div
                role="alert"
                style={{
                  marginBottom: "1rem",
                  fontSize: "0.95rem",
                  color: "#444",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "#F44336" }}>
                  {row?.firstName} {row?.surname}
                </strong>{" "}
                is currently initiated for{" "}
                <strong style={{ color: "#F44336" }}>{blockedArm}</strong>.
                Discontinue this active enrollment before starting another!
              </div>
            ) : (
              <div
                style={{
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: "#444",
                }}
              >
                Choose the service line to enroll{" "}
                <strong>
                  {row?.firstName} {row?.surname}
                </strong>{" "}
                into.
              </div>
            )}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {ENTRY_POINTS.map((entry) => {
                const isPrepDisabledByAge =
                  entry.code === "PrEP" && prepBlockedByAge;
                const isPrepDisabledByEarlyDetect =
                  entry.code === "PrEP" && prepBlockedByEarlyDetect;
                const isPrepDisabled =
                  isPrepDisabledByAge || isPrepDisabledByEarlyDetect;
                const disabled = !!blockedArm || isPrepDisabled;
                const disabledReason = blockedArm
                  ? `Client is currently active on ${blockedArm}. Discontinue it before enrolling.`
                  : isPrepDisabledByEarlyDetect
                  ? "Latest HTS encounter indicates a reactive antigen result — only PEP can be initiated."
                  : isPrepDisabledByAge
                  ? "Not available for clients under 15. Please use PEP."
                  : null;
                return (
                  <EntryPointCard
                    key={entry.code}
                    entry={entry}
                    onSelect={handleEnroll}
                    disabled={disabled}
                    disabledReason={disabledReason}
                  />
                );
              })}
            </div>
          </>
        </DialogContent>
      </Dialog>

      <HtsWarningModal
        isOpen={htsWarnOpen}
        onReturnToDashboard={() => setHtsWarnOpen(false)}
        dismissLabel="Close"
      />
    </>
  );
});

const Patients = (props) => {
  const classes = useStyles();
  const [showPPI, setShowPPI] = useState(true);
  const pageCacheRef = useRef(new Map());
  const PAGE_CACHE_TTL_MS = 60000;

  const fetchHtsPage = useCallback((query) => {
    const search = query.search || "";
    const key = `${query.pageSize}|${query.page}|${search}`;
    const cache = pageCacheRef.current;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < PAGE_CACHE_TTL_MS) {
      return Promise.resolve(hit.payload);
    }
    return axios
      .get(
        `${baseUrl}prep/persons/hts?pageSize=${query.pageSize}&pageNo=${query.page}&searchValue=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((result) => {
        const payload = {
          records: result?.data?.records || [],
          totalCount: result?.data?.totalRecords || 0,
        };
        cache.set(key, { ts: Date.now(), payload });
        return payload;
      });
  }, []);

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
        data={(query) =>
          fetchHtsPage(query)
            .then((payload) => ({
              data: (payload.records || []).map((row) => ({
                name: row.firstName + " " + row.surname,
                hospital_number: row.hospitalNumber,
                gender: row && row.gender ? row.gender : "",
                age: row.age,
                actions: <EnrollPatientButton row={row} />,
              })),
              page: query.page,
              totalCount: payload.totalCount,
            }))
            .catch(() => ({ data: [], page: query.page, totalCount: 0 }))
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
          Toolbar: (props) => (
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
