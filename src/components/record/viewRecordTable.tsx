import React, { useEffect, useState } from 'react';
import { Button, Input, Spin, Table, message } from 'antd';
import styled from 'styled-components';
import AWS from 'aws-sdk';
import { ColumnsType } from 'antd/es/table/interface';
import RecordChart from '../charts/recordChart.tsx';
import { Buttons } from '../theme/color.tsx';
import { SearchProps } from 'antd/es/input/Search';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import EditRecord from '../modals/EditRecord.tsx';

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
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');
  const [searchedRecords, setSearchedRecords] = useState<DataType[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [recordValue, setRecordValue] = useState<DataType>();
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [healthCheckId, setHealthCheckId] = useState<string[]>([]);

  AWS.config.update({
    accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
    secretAccessKey: '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',
    region: 'us-east-1'
  });

  const route53 = new AWS.Route53();

  useEffect(() => {
    const viewDNSRecord = async () => {
      try {
        const domains = await route53.listHostedZones().promise();

        for (let i = 0; i < domains.HostedZones.length; i++) {
          const DOMAIN = domains.HostedZones[i].Name;
          const YOUR_HOSTED_ZONE_ID = domains.HostedZones[i].Id;

          const params = {
            HostedZoneId: YOUR_HOSTED_ZONE_ID,
            StartRecordName: DOMAIN
          };

          const response = await route53.listResourceRecordSets(params).promise();
          console.log('response: ', response);
          const healthCheckIdForAllZone = await route53.listHealthChecks().promise();
          const healthCheckIds = healthCheckIdForAllZone.HealthChecks.map(healthCheck => healthCheck.Id);
          setHealthCheckId(healthCheckIds);
          console.log(healthCheckId);

          // const rp = await route53.li().promise();
          // console.log('rp =================>>>>>>>>>>>>> ', rp);
          
       
          
          const records = response.ResourceRecordSets.map((record: any) => ({
            key: `${record.Name}-${record.Type}-${record.ResourceRecordSetId || ''}`,
            recordName: record.Name,
            recordType: record.Type,
            routingPolicy: record.RoutingPolicy || 'Simple Routing',
            differentiator: record.Differentiatior || '-',
            alias: record.AliasTarget ? 'Yes' : 'No',
            valueOrRouteTrafficTo: record.ResourceRecords ? record.ResourceRecords.map((rec: any) => rec.Value) : [],
            ttlInSeconds: record.TTL || 0,
            healthCheckId: record.HealthCheckId || '-',
            evaluateTargetHealth: record.EvaluateTargetHealth || '-',
            recordId: record.ResourceRecordSetId || '-'
          }));
         
          const uniqueRecords = new Set(records.map(record => JSON.stringify(record)));

          const uniqueRecordsArray = Array.from(uniqueRecords).map(record => JSON.parse(record));

          uniqueRecordsArray.forEach((uniqueRecord) => {
            const exists = DNSRecords.some(existingRecord =>
              JSON.stringify(existingRecord) === JSON.stringify(uniqueRecord)
            );

            console.log("exostongggggggg",exists);
            

            if (!exists) {
              DNSRecords.push(uniqueRecord);
            }
          });
        }

        console.log('edeefefefefef ',DNSRecords);
        
        setSearchedRecords(DNSRecords);
        setIsDataLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error('Error getting DNS records:', error.message);
        setLoading(false);
      }
    };

    viewDNSRecord();
  }, []);

  const onSearch: SearchProps['onSearch'] = (value) => {
    setSearchText(value);
    const filteredRecords = DNSRecords.filter(record => {
      const searchTextLower = value.toLowerCase();
      const recordString = JSON.stringify(record).toLowerCase();
      return recordString.includes(searchTextLower);
    });
    setSearchedRecords(filteredRecords);
  };

  const handleDeleteRecord = async (record: DataType) => {
    try {
      setActionLoading(true);
      if (record.recordType === 'SOA' || record.recordType === 'NS') {
        message.warning('A HostedZone must contain exactly one SOA and NS record');
        return ;
      }

      let YOUR_HOSTED_ZONE_ID;
      const listHostedZone = await route53.listHostedZones().promise();

      const hostedZone = listHostedZone.HostedZones.find(zone => zone.Name === record.recordName);
      if ( hostedZone ) {
        YOUR_HOSTED_ZONE_ID = hostedZone.Id;
      } else {
        console.error('Hosted zone not found for record:', record.recordName);
      }

      console.log("----======---- ", YOUR_HOSTED_ZONE_ID);
      
      const params = {
        HostedZoneId: YOUR_HOSTED_ZONE_ID,
        ChangeBatch: {
          Changes: [
            {
              Action: 'DELETE',
              ResourceRecordSet: {
                Name: record.recordName,
                Type: record.recordType,
                ResourceRecords: record.valueOrRouteTrafficTo.map(value => ({ Value: value })),
                TTL: record.ttlInSeconds
              }
            }
          ]
        }
      };
  
      await route53.changeResourceRecordSets(params).promise();

      setSearchedRecords(searchedRecords.filter(r => r.key !== record.key));
      message.success('Record deleted successfully');
      setActionLoading(false);
    } catch (error) {
      console.error('Error deleting record:', error);
      message.error('Failed to delete record');
      setActionLoading(false);
    }
  }

  const handleEditRecord = async (record: DataType) => {
    console.log('record ---------->>>>>>>>>>> ',record);
    if(record.recordType === 'SOA' || record.recordType === 'NS') {
      message.info(`For SOA / NS, Can't edit record`);
      setIsEditModalOpen(false);
      return ;
    }
    setIsEditModalOpen(true);
    setRecordValue(record);
  }

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
    // {
    //   title: 'Differentiator',
    //   dataIndex: 'differentiator',
    //   key: 'differentiator',
    //   sorter: (a, b) => {
    //     const check1 = a.differentiator || ""
    //     const check2 = b.differentiator || ""
    //     return check1.localeCompare(check2)
    //   },
    //   sortDirections: ['descend', 'ascend'],
    // },
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
    // {
    //   title: 'Health Check ID',
    //   dataIndex: 'healthCheckId',
    //   key: 'healthCheckId',
    //   sorter: (a, b) => {
    //     const check1 = a.healthCheckId || ""
    //     const check2 = b.healthCheckId || ""
    //     return check1.localeCompare(check2)
    //   },
    //   sortDirections: ['descend', 'ascend'],
    // },
    // {
    //   title: 'Evaluate Target Health',
    //   dataIndex: 'evaluateTargetHealth',
    //   key: 'evaluateTargetHealth',
    //   sorter: (a, b) => {
    //     const check1 = a.evaluateTargetHealth || ""
    //     const check2 = b.evaluateTargetHealth || ""
    //     return check1.localeCompare(check2)
    //   },
    //   sortDirections: ['descend', 'ascend'],
    // },
    // {
    //   title: 'Record ID',
    //   dataIndex: 'recordId',
    //   key: 'recordId',
    //   sorter: (a, b) => {
    //     const id1 = a.recordId || ""
    //     const id2 = b.recordId || ""
    //     return id1.localeCompare(id2)
    //   },
    //   sortDirections: ['descend', 'ascend'],
    // },
    {
      title: 'Actions',
      dataIndex: 'DeleteOrEdit',
      key: 'DeleteOrEdit',
      render: (_, record) => (
        <>
          <StyledDeleteButton type='link' onClick={() => handleDeleteRecord(record)} loading={actionLoading}><DeleteOutlined /></StyledDeleteButton>
          <StyledEditButton type='link' onClick={() => handleEditRecord(record)}><EditOutlined /></StyledEditButton>
        </>
      ),
      align: 'center',
    }
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
          <RecordChart chartData={chartData} />
          <StyledButton onClick={() => setViewChart(false)}>Back to Table</StyledButton>
        </>
      ) : (
        <>
          <GlobalSearchOfTable>
            <ViewChartButton onClick={handleViewChart}>View Chart</ViewChartButton>
            <Input
              placeholder="Search"
              allowClear
              style={{ width: '12%', marginBottom: '1%', justifyContent: 'flex-end' }}
              onChange={(e) => onSearch(e.target.value)}
            />
          </GlobalSearchOfTable>
          <ViewContentOfTable>
            {loading ? (
              <StyledLoader spinning={loading} />
            ) : isDataLoaded ? (
              searchedRecords.length > 0 || searchText === '' ? (
                <ContentOfTable
                  columns={columns}
                  dataSource={searchedRecords}
                  loading={loading}
                />
              ) : (
                <LoadingText>No DNS Records found Matching this Search.</LoadingText>
              )
            ) : (
              <LoadingText>No data available.</LoadingText>
            )}
            {
              isEditModalOpen && (
                <EditRecord
                  record={recordValue}
                  isEditModalOpen={isEditModalOpen}
                  setIsEditModalOpen={setIsEditModalOpen}
                />
              )
            }
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

const StyledLoader = styled(Spin)`
  display:flex;
  justify-content: center;
`
const ContentOfTable = styled(Table) <{ columns: ColumnsType<DataType>; dataSource: DataType[] }>``;

const LoadingText = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledDeleteButton = styled(Button)`
  color: ${Buttons.lightRed};
  border: none;
  &&&:hover {
    color: ${Buttons.red};
  }
`;

const StyledEditButton = styled(Button)`
  color: ${Buttons.backgroundColor};
  border: none;
  &&&:hover {
    color: ${Buttons.hover};
  }
`;