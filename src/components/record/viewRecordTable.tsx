import React, { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, InputRef, Space, Table } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import Highlighter from 'react-highlight-words';
import styled from 'styled-components';
import DomainChart from '../charts/domainChart.tsx';

type DataIndex = keyof DataType;

interface DataType {
    key: React.Key;
    recordName: string;
    recordType: string;
    routingPolicy: string;
    differentiator: string;
    alias: string;
    valueOrRouteTrafficTo: string[];
    ttlInSeconds: number;
    healthCheckId: string;
    evaluateTargetHealth: string;
    recordId: string;
}

const data: DataType[] = [
    {
        key: '1',
        recordName: 'dnsmanager.live',
        recordType: 'PTR',
        routingPolicy: 'Failover',
        differentiator: 'Primary',
        alias: 'No',
        valueOrRouteTrafficTo: [
          'ns-1403.awsdns-47.org.',
          'ns-826.awsdns-39.net.',
          'ns-1990.awsdns-56.co.uk.',
          'ns-314.awsdns-39.com.,'
        ],
        ttlInSeconds: 300,
        healthCheckId: '21e321af-7c18-446d-a839-13449827a29c',
        evaluateTargetHealth: '',
        recordId: 'ptr-id-1',
    },
];

const ViewRecordTable: React.FC = () => {
    const [searchText, setSearchText] = useState<string>('');
    const [searchTextOfColumn, setSearchTextOfColumn] = useState<string>('');
    const [searchedColumn, setSearchedColumn] = useState<string>('');
    const searchInputOfColumn = useRef<InputRef>(null);
    const [viewChart, setViewChart] = useState<boolean>(false);

    const handleViewChart = (value: boolean) => {
      setViewChart(value);
    }
    const handleSearch = (
        selectedKeys: string[],
        confirm: () => void,
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchTextOfColumn(selectedKeys[0]);
        setSearchedColumn(dataIndex.toString());
    };
    
    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchTextOfColumn('');
    };

    const filteredData = data.filter(record =>
        record.recordName.toLowerCase().includes(searchText.toLowerCase()) ||
        record.recordType.toLowerCase().includes(searchText.toLowerCase()) ||
        record.routingPolicy.toLowerCase().includes(searchText.toLowerCase()) ||
        record.differentiator.toLowerCase().includes(searchText.toLowerCase()) ||
        record.alias.toLowerCase().includes(searchText.toLowerCase()) ||
        record.valueOrRouteTrafficTo.join(',').toLowerCase().includes(searchText.toLowerCase()) ||
        record.ttlInSeconds.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        record.evaluateTargetHealth.toLowerCase().includes(searchText.toLowerCase()) ||
        record.healthCheckId.toLowerCase().includes(searchText.toLowerCase()) ||
        record.recordId.toLowerCase().includes(searchText.toLowerCase())
    );
    
    const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
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
            <Button
                onClick={() => clearFilters && handleReset(clearFilters)}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  confirm({ closeDropdown: false });
                  setSearchTextOfColumn((selectedKeys as string[])[0]);
                  setSearchedColumn(dataIndex);
                }}
              >
                Filter
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  close();
                }}
              >
                close
              </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilterDropdownVisibleChange: (visible: boolean) => {
        if (visible) {
          setTimeout(() => searchInputOfColumn.current?.select(), 100);
        }
      },
      render: (text: string) =>
        searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchTextOfColumn]}
            autoEscape
            textToHighlight={text}
          />
        ) : (
          text
        ),
    });
    
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
          title: 'Differentiator',
          dataIndex: 'differentiator',
          key: 'differentiator',
          ...getColumnSearchProps('differentiator'),
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
    ]; 

    return (
      <ViewTableOfRecord>
        {viewChart === true ? (
          <>
            <GlobalSearchOfTable>
              <ViewChartButton onClick={() => handleViewChart(!viewChart)}>View Chart</ViewChartButton>
            </GlobalSearchOfTable>
            <DomainChart />
          </>
        ) : (
          <>
            <GlobalSearchOfTable>
            <ViewChartButton onClick={() => handleViewChart(!viewChart)}>View Chart</ViewChartButton>
              <GlobalSearchOfTableInputField
                  placeholder="Search"
                  allowClear
                  onChange={(e) => setSearchText(e.target.value)}
              />
            </GlobalSearchOfTable>
            <ViewContentOfTable>
                <ContentOfTable
                    columns={columns}
                    dataSource={filteredData}
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

const ViewChartButton = styled(Button)`
  margin-right: auto;
`;

const GlobalSearchOfTable = styled.div`
    display: flex;
`;

const GlobalSearchOfTableInputField = styled(Input)`
    width: 12%;
    margin-bottom: 1%;
    justify-content: flex-end;
`;

const ViewContentOfTable = styled.div`
    margin: 0.4%;
`;

const ContentOfTable = styled(Table)<{ columns: ColumnsType<DataType>; dataSource: DataType[] }>``;
