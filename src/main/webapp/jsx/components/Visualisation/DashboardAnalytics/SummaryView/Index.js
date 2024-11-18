import React from 'react';
import { Col, CardBody, Row } from 'reactstrap';
import { Card } from '@material-ui/core';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ReceivingArtByAge } from './Highcharts/ReceivingArtByAge';
import { ReceivingArtBySex } from './Highcharts/ReceivingArtBySex';

const SummaryView = props => {
  return (
    <div spacing={5} style={{ padding: 20 }}>
      <Row>
        <Col md={12}>
          <Row>
            <Col lg={6} md={6} sm={12} xs={12} className="mb-4">
              <Card>
                <CardBody>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={ReceivingArtBySex}
                  />
                </CardBody>
              </Card>
            </Col>
            <Col lg={6} md={6} sm={12} xs={12} className="mb-4">
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
