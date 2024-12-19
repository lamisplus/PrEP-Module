import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePermissions } from '../../../hooks/usePermissions';
import ButtonMui from '@material-ui/core/Button';
import axios from 'axios';
import { forwardRef } from 'react';
import { Grid, Paper } from '@mui/material';
import { Modal, ModalBody, ModalHeader, FormGroup } from 'reactstrap';

import moment from 'moment';
import 'semantic-ui-css/semantic.min.css';
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
import '@reach/menu-button/styles.css';
import { Label } from 'semantic-ui-react';
import CustomTable from '../../../Reusables/CustomTable';
import { token as token, url as baseUrl } from './../../../api';
import { toast } from 'react-toastify';
import ProtectedComponent from '../PrepServices/PrivateComponent';

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

const PatientVisits = props => {
  const { patientObj } = props;
  const { hasAnyPermission } = usePermissions();
  const [checkinStatus, setCheckinStatus] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkinDate, setCheckinDate] = useState(new Date());
  const [checkoutDate, setCheckoutDate] = useState(new Date());
  const [selectedServices, setSelectedServices] = useState({ selected: [] });
  const [services, setServices] = useState([]);
  const [patientVisits, setPatientVisits] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPPI, setShowPPI] = useState(false);

  const permissions = useMemo(
    () => ({
      view_patient: hasAnyPermission('view_patient', 'all_permissions'),
    }),
    [hasAnyPermission]
  );

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}patient/post-service`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllServices(response.data);
      setServices(
        response.data.map(service => ({
          label: service.moduleServiceName,
          value: service.moduleServiceCode,
        }))
      );
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPatientVisits = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}patient/visit/visit-by-patient/${
          patientObj?.personId || patientObj.id
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPatientVisits(response.data);
      const hasActiveVisit = response.data.some(
        visit => !visit.checkOutTime || visit.status === 'PENDING'
      );
      setCheckinStatus(hasActiveVisit);
    } catch (error) {
      toast.error('Failed to fetch patient visits');
    }
  }, [patientObj.id]);

  useEffect(() => {
    fetchServices();
    fetchPatientVisits();
  }, [fetchServices, fetchPatientVisits]);

  const handleCheckout = async () => {
    const activeVisit = patientVisits.find(visit => visit.status === 'PENDING');
    if (!activeVisit) {
      toast.error('No Pending visit found');
      return;
    }

    try {
      await axios.put(
        `${baseUrl}patient/visit/checkout/${activeVisit.id}`,
        { checkOutDate: moment(checkoutDate).format('YYYY-MM-DD HH:mm') },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCheckinStatus(false);
      setIsCheckoutModalOpen(false);
      fetchPatientVisits();
    } catch (error) {
      toast.error('Check-out failed');
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Check In Date',
        field: 'checkInDate',
        render: rowData =>
          moment(rowData.checkInDate).format('YYYY-MM-DD HH:mm'),
      },
      {
        title: 'Check Out Date',
        field: 'checkOutDate',
        render: rowData =>
          rowData.checkOutDate
            ? moment(rowData.checkOutDate).format('YYYY-MM-DD HH:mm')
            : 'N/A',
      },
      { title: 'Service', field: 'service' },
      { title: 'Status', field: 'status' },
    ],
    []
  );

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        {checkinStatus && (
          <ProtectedComponent
            privateComponent={() => (
              <ButtonMui
                variant="contained"
                style={{
                  backgroundColor: 'green',
                  color: 'white',
                  marginLeft: '10px',
                }}
                onClick={() => setIsCheckoutModalOpen(true)}
              >
                Check Out
              </ButtonMui>
            )}
            isAuthorized={true}
          />
        )}
      </div>

      <CustomTable
        title="Patient Visits"
        columns={columns}
        data={patientVisits}
        icons={tableIcons}
        isLoading={isLoading}
        onPPIChange={e => setShowPPI(!e.target.checked)}
      />

      <Modal
        isOpen={isCheckoutModalOpen}
        toggle={() => setIsCheckoutModalOpen(false)}
        size="lg"
      >
        <ModalHeader toggle={() => setIsCheckoutModalOpen(false)}>
          <h5 style={{ fontWeight: 'bold', color: '#014d88' }}>Check Out</h5>
        </ModalHeader>
        <ModalBody>
          <Paper style={{ padding: '20px' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormGroup>
                  <Label style={{ color: '#014d88', fontWeight: 'bold' }}>
                    Check-out Date *
                  </Label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={moment(checkoutDate).format('YYYY-MM-DDTHH:mm')}
                    onChange={e => setCheckoutDate(new Date(e.target.value))}
                    max={moment().format('YYYY-MM-DDTHH:mm')}
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12}>
                <ButtonMui
                  variant="contained"
                  color="primary"
                  onClick={handleCheckout}
                >
                  Confirm Check Out
                </ButtonMui>
                <ButtonMui
                  variant="contained"
                  style={{
                    backgroundColor: '#992E62',
                    marginLeft: '10px',
                    color: 'white',
                  }}
                  onClick={() => setIsCheckoutModalOpen(false)}
                >
                  Cancel
                </ButtonMui>
              </Grid>
            </Grid>
          </Paper>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default PatientVisits;
