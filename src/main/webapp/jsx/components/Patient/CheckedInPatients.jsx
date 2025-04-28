import { useState, useMemo, memo } from 'react';
import { url as baseUrl, token, wsUrl } from './../../../api';
import { forwardRef } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Link } from 'react-router-dom';
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
import { Card, CardBody } from 'reactstrap';
import 'react-toastify/dist/ReactToastify.css';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { MdDashboard } from 'react-icons/md';
import '@reach/menu-button/styles.css';
import { Label } from 'semantic-ui-react';
import SockJsClient from 'react-stomp';
import CustomTable from '../../../Reusables/CustomTable.js';
import { usePermissions } from '../../../hooks/usePermissions.js';
import { useCheckedInPatientData } from '../../../hooks/useCheckedInPatientData.jsx';
import { ArrowForward } from '@mui/icons-material';
import { TiArrowForward } from 'react-icons/ti';
import { Dashboard } from '@material-ui/icons';

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

const CheckedInPatients = props => {
  const { hasPermission } = usePermissions();
  const { fetchPatients } = useCheckedInPatientData(baseUrl, token);
  const getData = async query => {
    try {
      const data = await fetchPatients(query);
      const reversedData = [...(data || [])].reverse();

      return {
        data: reversedData,
        page: query?.page || 0,
        totalCount: reversedData.length || 0,
      };
    } catch (error) {
      return {
        data: [],
        page: 0,
        totalCount: 0,
      };
    }
  };

  const permissions = useMemo(
    () => ({
      canSeeEnrollButton: hasPermission('HIV Enrollment Register'),
    }),
    [hasPermission]
  );

  const [showPPI, setShowPPI] = useState(true);
  const [tableRefreshTrigger, setTableRefreshTrigger] = useState(0);

  const onMessageReceived = msg => {
    if (msg && msg?.toLowerCase()?.includes('check')) {
      setTableRefreshTrigger(prev => prev + 1);
    }
  };

  const handleCheckBox = e => {
    setShowPPI(!e.target.checked);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Patient Name',
        field: 'name',
        hidden: showPPI,
        render: rowData => rowData.fullname.trim(),
      },
      {
        title: 'Hospital Number',
        field: 'hospitalNumber',
        filtering: false,
      },
      {
        title: 'Sex',
        field: 'sex',
        filtering: false,
      },
      {
        title: 'Date of Birth',
        field: 'dateOfBirth',
        filtering: false,
      },
      {
        title: 'Age',
        field: 'age',
        filtering: false,
      },
      {
        title: 'Actions',
        field: 'actions',
        filtering: false,
        render: rowData => (
          <div>
            <Link
              to={{
                pathname: '/patient-dashboard',
                state: { patientObj: rowData },
              }}
            >
              <ButtonGroup
                variant="contained"
                aria-label="split button"
                size="large"
                style={{
                  width: '200px', // Set a fixed width for the ButtonGroup
                }}
              >
                {rowData?.isOnPrep ? (
                  <Button
                    startIcon={
                      <Dashboard
                        color="inherit"
                        style={{
                          color: '#fff',
                          fontSize: '1em',
                        }}
                      />
                    }
                    style={{
                      backgroundColor: 'rgb(153, 46, 98)',
                      width: '100%', // Ensure the button takes the full width of the ButtonGroup
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#fff',
                        fontWeight: 'bolder',
                      }}
                    >
                      Patient Dashboard
                    </span>
                  </Button>
                ) : (
                  <Button
                    startIcon={
                      <TiArrowForward
                        style={{
                          color: '#fff',
                          fontSize: '1em',
                        }}
                      />
                    }
                    style={{
                      backgroundColor: 'rgb(153, 46, 98)',
                      width: '100%', // Ensure the button takes the full width of the ButtonGroup
                      color: '#fff',
                      fontSize: '1em',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#fff',
                        fontWeight: 'bolder',
                      }}
                    >
                      PrEP screening
                    </span>
                  </Button>
                )}
              </ButtonGroup>
            </Link>
          </div>
        ),
      },
    ],
    [showPPI]
  );
  return (
    <div>
      <SockJsClient
        url={wsUrl}
        topics={['/topic/checking-in-out-process']}
        onMessage={onMessageReceived}
        debug={true}
      />
      <Card>
        <CardBody>
          <CustomTable
            key={tableRefreshTrigger}
            title="Find Patient"
            columns={columns}
            data={getData}
            icons={tableIcons}
            showPPI={showPPI}
            onPPIChange={handleCheckBox}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default memo(CheckedInPatients);
