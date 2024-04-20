import React, { useEffect, useState } from 'react';
import { Button, Input, Table } from 'antd';
import styled from 'styled-components';
import AWS from 'aws-sdk';
import { ColumnsType } from 'antd/es/table/interface';

interface DataType {
  key: string;
  recordName: string;
  recordType: string;
  routingPolicy?: string | undefined;
  alias: string;
  valueOrRouteTrafficTo: string[];
  ttlInSeconds: number;
  healthCheckId?: string | undefined;
  evaluateTargetHealth?: string | undefined;
  recordId?: string | undefined;
}

const ViewRecordTable: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [dnsRecords, setDnsRecords] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDNSRecords = async () => {
      try {
        AWS.config.update({
          accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
          secretAccessKey: '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',
          region: 'us-east-1'
      });
      
        const route53 = new AWS.Route53();
      
        const domain = 'dnsmanager.live'; 
        const params = {
          HostedZoneId: 'Z03475321WH1NH01XRPEQ',
          StartRecordName: domain,
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
      
        setDnsRecords(records);
        setLoading(false);
      } catch (error) {
        console.error('Error getting DNS records:', error.message);
        setLoading(false);
      }
    };
    
    fetchDNSRecords();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredData = dnsRecords.filter(record =>
    record.recordName.toLowerCase().includes(searchText.toLowerCase()) ||
    record.recordType.toLowerCase().includes(searchText.toLowerCase()) ||
    record.routingPolicy?.toLowerCase().includes(searchText.toLowerCase()) ||
    record.alias.toLowerCase().includes(searchText.toLowerCase()) ||
    record.valueOrRouteTrafficTo.join(',').toLowerCase().includes(searchText.toLowerCase()) ||
    record.ttlInSeconds.toString().toLowerCase().includes(searchText.toLowerCase()) ||
    record.healthCheckId?.toLowerCase().includes(searchText.toLowerCase()) ||
    record.evaluateTargetHealth?.toLowerCase().includes(searchText.toLowerCase()) ||
    record.recordId?.toLowerCase().includes(searchText.toLowerCase()) 
  );

  const columns: ColumnsType<DataType> = [
    {
      title: 'Record Name',
      dataIndex: 'recordName',
      key: 'recordName'
    },
    {
      title: 'Record Type',
      dataIndex: 'recordType',
      key: 'recordType'
    },
    {
      title: 'Routing Policy',
      dataIndex: 'routingPolicy',
      key: 'routingPolicy'
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias'
    },
    {
      title: 'Value/Route Traffic To',
      dataIndex: 'valueOrRouteTrafficTo',
      key: 'valueOrRouteTrafficTo',
      render: (values: string[]) => (
        <ul>
          {values.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      )
    },
    {
      title: 'TTL (in seconds)',
      dataIndex: 'ttlInSeconds',
      key: 'ttlInSeconds'
    },
    {
      title: 'Health Check ID',
      dataIndex: 'healthCheckId',
      key: 'healthCheckId'
    },
    {
      title: 'Evaluate Target Health',
      dataIndex: 'evaluateTargetHealth',
      key: 'evaluateTargetHealth'
    },
    {
      title: 'Record ID',
      dataIndex: 'recordId',
      key: 'recordId'
    }
  ];

  return (
    <ViewTableOfRecord>
      <GlobalSearchOfTable>
        <ViewChartButton >View Chart</ViewChartButton>
        <Input
          placeholder="Search"
          allowClear
          onChange={handleSearchChange}
          style={{ width: '12%', marginBottom: '1%', justifyContent: 'flex-end' }}
        />
      </GlobalSearchOfTable>
      <ViewContentOfTable>
        {loading ? (
          <LoadingText>Loading...</LoadingText>
        ) : dnsRecords.length > 0 ? (
          <ContentOfTable
            columns={columns}
            dataSource={filteredData}
            pagination={false}
            onChange={() => {}} 
          />
        ) : (
          <LoadingText>No DNS records found</LoadingText>
        )}
      </ViewContentOfTable>
    </ViewTableOfRecord>
  );
};

export default ViewRecordTable;

const ViewTableOfRecord = styled.div`
  margin-top: 2%;
`;

const ViewChartButton = styled(Button)`
  margin-right: auto;
`;

const GlobalSearchOfTable = styled.div`
  display: flex;
`;

const ViewContentOfTable = styled.div`
  margin: 0.4%;
`;

const ContentOfTable = styled(Table)<{ columns: ColumnsType<DataType>; dataSource: DataType[] }>``;

const LoadingText = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  padding: 20px;
`;
