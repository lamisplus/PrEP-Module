import React, { useState } from 'react';

import { Col, CardBody, Row } from 'reactstrap';
import { Card, makeStyles } from '@material-ui/core';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ReceivingArtByAge } from './Highcharts/ReceivingArtByAge';
import { ReceivingArtBySex } from './Highcharts/ReceivingArtBySex';

const useStyles = makeStyles(theme => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 200,
    },
  },
  card: {
    margin: theme.spacing(20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const SummaryView = props => {
  const classes = useStyles();
  const [chartValue, setChartValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(!dropdownOpen);
  const [state, setState] = useState({ activeItem: 'gamepad' });

  const handleItemClick = (e, { name }) => setState({ activeItem: name });
  const { activeItem } = state;
  const chartPage = e => {
    setChartValue(e);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div spacing={5} style={{ padding: 20 }}>
      <Row>
        <Col md={12}>
          <Row>
            <Col lg={6} md={6} sm={12} xs={12} className='mb-4'>
              <Card>
                <CardBody>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={ReceivingArtBySex}
                  />
                </CardBody>
              </Card>
            </Col>
            <Col lg={6} md={6} sm={12} xs={12} className='mb-4'>
              <Card>
                <CardBody>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={ReceivingArtByAge}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default SummaryView;
