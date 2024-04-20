import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined, EditOutlined, DeleteRowOutlined } from '@ant-design/icons';
import { Button, Input, InputRef, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import styled from 'styled-components';
import DomainChart from '../charts/domainChart.tsx';
import DeleteDNSRecordModal from '../modals/deleteDNSRecordModal.tsx';
import EditDNSRecordModal from '../modals/editDNSRecordModal.tsx';
import AWS from 'aws-sdk';
import { ColumnType, ColumnsType } from 'antd/es/table/interface';
import RecordChart from '../charts/recordChart.tsx';

type DataIndex = keyof DataType;

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

const ViewRecordTable: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchTextOfColumn, setSearchTextOfColumn] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInputOfColumn = useRef<InputRef>(null);
  const [viewChart, setViewChart] = useState<boolean>(false);
  const [isEditButtonClicked, setIsEditButtonClicked] = useState<boolean>(false);
  const [isDeleteButtonClicked, setIsDeleteButtonClicked] = useState<boolean>(false);
  const [dnsRecords, setDnsRecords] = useState<DataType[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const YOUR_HOSTED_ZONE_ID = 'Z03475321WH1NH01XRPEQ';

  useEffect(() => {
    AWS.config.update({
      accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
      secretAccessKey: 'NTPeGEsBvab72xrgEuEP1OLHxzL1VwQBAqpySk0Q',
      region: 'us-east-1'
    });

    const route53 = new AWS.Route53();

    const viewDNSRecord = async () => {
      const domain = 'dnsmanager.live'; // You might want to replace this
      const params = {
        HostedZoneId: YOUR_HOSTED_ZONE_ID,
        StartRecordName: domain,
      };

      try {
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
        setLoading(false); // Data fetching completed
      } catch (error) {
        console.error('Error getting DNS records:', error.message);
        setLoading(false); // Error occurred while fetching data
      }
    };

    viewDNSRecord();

    return () => {
      // Cleanup code if needed
    };
  }, []);

  const handleDeleteRecord = () => {
    setIsDeleteButtonClicked(true);
  };

  const handleEditRecord = () => {
    setIsEditButtonClicked(true);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchTextOfColumn('');
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchTextOfColumn(selectedKeys[0]);
    setSearchedColumn(dataIndex.toString());
    setSearchText('');
  };
  
  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInputOfColumn}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] || ''}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    render: (text: string) =>
      searchedColumn === dataIndex.toString() ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchTextOfColumn]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });  

  const filteredData = dnsRecords.filter(record =>
    (record.recordName.toLowerCase().includes(searchText.toLowerCase())) ||
    (record.recordType.toLowerCase().includes(searchText.toLowerCase())) ||
    (record.routingPolicy?.toLowerCase().includes(searchText.toLowerCase()) ?? false) ||
    (record.alias.toLowerCase().includes(searchText.toLowerCase())) ||
    (record.valueOrRouteTrafficTo.join(',').toLowerCase().includes(searchText.toLowerCase())) ||
    (record.ttlInSeconds.toString().toLowerCase().includes(searchText.toLowerCase())) ||
    (record.healthCheckId?.toLowerCase().includes(searchText.toLowerCase())) ||
    (record.evaluateTargetHealth?.toLowerCase().includes(searchText.toLowerCase()) ?? false) ||
    (record.recordId?.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'recordName',
      key: 'recordName',
      ...getColumnSearchProps('recordName'),
    },
    {
      title: 'Record Type',
      dataIndex: 'recordType',
      key: 'recordType',
      ...getColumnSearchProps('recordType'),
    },
    {
      title: 'Routing Policy',
      dataIndex: 'routingPolicy',
      key: 'routingPolicy',
      ...getColumnSearchProps('routingPolicy'),
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      key: 'alias',
      ...getColumnSearchProps('alias'),
    },
    {
      title: 'Value/Route Traffic To',
      dataIndex: 'valueOrRouteTrafficTo',
      key: 'valueOrRouteTrafficTo',
      ...getColumnSearchProps('valueOrRouteTrafficTo'),
    },
    {
      title: 'TTL (in seconds)',
      dataIndex: 'ttlInSeconds',
      key: 'ttlInSeconds',
      ...getColumnSearchProps('ttlInSeconds'),
    },
    {
      title: 'Health Check ID',
      dataIndex: 'healthCheckId',
      key: 'healthCheckId',
      ...getColumnSearchProps('healthCheckId'),
    },
    {
      title: 'Evaluate Target Health',
      dataIndex: 'evaluateTargetHealth',
      key: 'evaluateTargetHealth',
      ...getColumnSearchProps('evaluateTargetHealth'),
    },
    {
      title: 'Record ID',
      dataIndex: 'recordId',
      key: 'recordId',
      ...getColumnSearchProps('recordId'),
    },
    {
      title: 'Edit',
      dataIndex: 'editRecord',
      key: 'editRecord',
      render: () => <Button type="link" onClick={handleEditRecord}><EditOutlined /></Button>,
    },
    {
      title: 'Delete',
      dataIndex: 'deleteRecord',
      key: 'deleteRecord',
      render: () => <Button type="link" onClick={handleDeleteRecord}><DeleteRowOutlined /></Button>,
    },
  ];

  const handleViewChart = () => {
    setViewChart(true);

    const dataForChart = dnsRecords.map(record => ({
      type: record.recordType,
      value: record.ttlInSeconds
    }));
    
    setChartData(dataForChart);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };


  return (
    <ViewTableOfRecord>
     {viewChart ? (
        <>
          <RecordChart chartData = {chartData} />
          <Button onClick={() => setViewChart(false)}>Back to Table</Button>
        </>
      )  : isDeleteButtonClicked ? (
        <DeleteDNSRecordModal isDeleteButtonClicked={isDeleteButtonClicked} onCancel={() => setIsDeleteButtonClicked(false)} />
      ) : isEditButtonClicked ? (
        <EditDNSRecordModal isEditButtonClicked={isEditButtonClicked} onCancel={() => setIsEditButtonClicked(false)} />
      ) : (
        <>
          <GlobalSearchOfTable>
            <ViewChartButton onClick={handleViewChart}>View Chart</ViewChartButton>
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
                onChange={() => {}} // Dummy function to prevent warning
              />
            ) : (
              <LoadingText>No DNS records found</LoadingText>
            )}
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