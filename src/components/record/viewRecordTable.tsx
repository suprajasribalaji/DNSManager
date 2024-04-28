import React, { useEffect, useState } from 'react';
import { Button, Input,Table } from 'antd';
import styled from 'styled-components';
import AWS from 'aws-sdk';
import { ColumnsType } from 'antd/es/table/interface';
import RecordChart from '../charts/recordChart.tsx';
import { Buttons } from '../theme/color.tsx';

interface DataType {
  key: React.Key;
  recordName: string;
  recordType: string;
  routingPolicy?: string;
  differentiator?: string;
  alias: string;
  valueOrRouteTrafficTo: string[];
  ttlInSeconds: number;
  healthCheckId?: string;
  evaluateTargetHealth?: string;
  recordId?: string;
}

const DNSRecords: DataType[] = [];

const ViewRecordTable: React.FC = () => {
  const [viewChart, setViewChart] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    AWS.config.update({
      accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
      secretAccessKey: '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',
      region: 'us-east-1'
    });
  
    const route53 = new AWS.Route53();
  
    const viewDNSRecord = async () => {
      try {
        const domains = await route53.listHostedZones().promise();
        console.log(domains.HostedZones.length);
  
        for (let i = 0; i < domains.HostedZones.length; i++) {
          const DOMAIN = domains.HostedZones[i].Name;
          const YOUR_HOSTED_ZONE_ID = domains.HostedZones[i].Id;
          console.log(DOMAIN, YOUR_HOSTED_ZONE_ID);
  
          const params = {
            HostedZoneId: YOUR_HOSTED_ZONE_ID,
            StartRecordName: DOMAIN
          };
  
          const response = await route53.listResourceRecordSets(params).promise();
          const records = response.ResourceRecordSets.map((record: any, index: number) => ({
            key: index.toString(),
            recordName: record.Name,
            recordType: record.Type,
            routingPolicy: record.RoutingPolicy || 'Simple',
            alias: record.AliasTarget ? 'Yes' : 'No',
            valueOrRouteTrafficTo: record.ResourceRecords ? record.ResourceRecords.map((rec: any) => rec.Value) : [],
            ttlInSeconds: record.TTL || 0,
            healthCheckId: record.HealthCheckId || '-',
            evaluateTargetHealth: record.EvaluateTargetHealth || '-',
            recordId: record.ResourceRecordSetId || '-'
          }));

          console.log('RECORDsss ------ ', records);
  
          const uniqueRecords = new Set(records.map(record => JSON.stringify(record)));
          const uniqueRecordsArray = Array.from(uniqueRecords).map(record => JSON.parse(record));
  
          uniqueRecordsArray.forEach((uniqueRecord) => {
            const exists = DNSRecords.find(existingRecord =>
              JSON.stringify(existingRecord) === JSON.stringify(uniqueRecord)
            );
  
            if (!exists) {
              DNSRecords.push(uniqueRecord);
            } 
          });
          setLoading(false);
          console.log('DNS RECORDs ========= ', DNSRecords);
        }
      } catch (error) {
        console.error('Error getting DNS records:', error.message);
        setLoading(true);
      }
    };
  
    viewDNSRecord();
  }, []);
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'recordName',
      key: 'recordName',
      sorter: (a, b) => a.recordName.localeCompare(b.recordName),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Record Type',
      dataIndex: 'recordType',
      key: 'recordType',
      sorter: (a, b) => a.recordType.localeCompare(b.recordType),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Routing Policy',
      dataIndex: 'routingPolicy',
      key: 'routingPolicy',
      sorter: (a, b) => {
        const policy1 = a.routingPolicy || ""
        const policy2 = b.routingPolicy || ""
        return policy1.localeCompare(policy2)
      },
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias',
      sorter: (a, b) => a.alias.localeCompare(b.alias),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Value/Route Traffic To',
      dataIndex: 'valueOrRouteTrafficTo',
      key: 'valueOrRouteTrafficTo',
    },
    {
      title: 'TTL (in seconds)',
      dataIndex: 'ttlInSeconds',
      key: 'ttlInSeconds',
      sorter: (a, b) => b.ttlInSeconds - a.ttlInSeconds,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Health Check ID',
      dataIndex: 'healthCheckId',
      key: 'healthCheckId',
      sorter: (a, b) => {
        const check1 = a.healthCheckId || ""
        const check2 = b.healthCheckId || ""
        return check1.localeCompare(check2)
      },
      sortDirections: ['descend', 'ascend'], 
    },
    {
      title: 'Evaluate Target Health',
      dataIndex: 'evaluateTargetHealth',
      key: 'evaluateTargetHealth',
      sorter: (a, b) => {
        const check1 = a.evaluateTargetHealth || ""
        const check2 = b.evaluateTargetHealth || ""
        return check1.localeCompare(check2)
      },
      sortDirections: ['descend', 'ascend'], 
    },
    {
      title: 'Record ID',
      dataIndex: 'recordId',
      key: 'recordId',
      sorter: (a, b) => {
        const id1 = a.recordId || ""
        const id2 = b.recordId || ""
        return id1.localeCompare(id2)
      },
      sortDirections: ['descend', 'ascend'], 
    },
  ];

  const handleViewChart = () => {
    setViewChart(true);

    const dataForChart = DNSRecords.map(record => ({
      type: record.recordType,
      value: record.ttlInSeconds
    }));
    
    setChartData(dataForChart);
  };

  return (
    <ViewTableOfRecord>
     {viewChart ? (
        <>
          <RecordChart chartData = {chartData} />
          <StyledButton onClick={() => setViewChart(false)}>Back to Table</StyledButton>
        </>
      )  :  (
        <>
          <GlobalSearchOfTable>
            <ViewChartButton onClick={handleViewChart}>View Chart</ViewChartButton>
            <Input
              placeholder="Search"
              allowClear
              style={{ width: '12%', marginBottom: '1%', justifyContent: 'flex-end' }}
            />
          </GlobalSearchOfTable>
          <ViewContentOfTable>
             <ContentOfTable
                columns={columns}
                dataSource={DNSRecords}
                loading={loading}
              />
            
          </ViewContentOfTable>
        </>
      )}
    </ViewTableOfRecord>
  );
};

export default ViewRecordTable;

const ViewTableOfRecord = styled.div`
  margin-top: 2%;
`;

const StyledButton = styled(Button)`
  background-color: ${Buttons.backgroundColor};
  color: ${Buttons.text};
  border: none;
  &&&:hover {
      color: ${Buttons.hover};
  }
`;

const ViewChartButton = styled(StyledButton)`
  margin-right: auto;
`;

const GlobalSearchOfTable = styled.div`
  display: flex;
`;

const ViewContentOfTable = styled.div`
  margin: 0.4%;
`;

const ContentOfTable = styled(Table)<{ columns: ColumnsType<DataType>; dataSource: DataType[] }>``;