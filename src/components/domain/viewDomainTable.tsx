import React, { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import type { InputRef } from 'antd';
import { styled } from 'styled-components';
import Highlighter from 'react-highlight-words';
import DomainChart from '../charts/domainChart.tsx';

type DataIndex = keyof DataType;

interface DataType {
    key: React.Key;
    domainName: string;
    privacyStatus: boolean;
    expirationDate: number; 
    autoRenew: boolean;
    transferLock: boolean;
}

const data: DataType[] = [
    {
      key: '1',
      domainName: 'dnsmanager.live',
      expirationDate: new Date('2025-11-01').getTime(), 
      privacyStatus: true,
      autoRenew: true,
      transferLock: false,
    },
    {
      key: '2',
      domainName: 'dnsmanager.com',
      expirationDate: new Date('2024-04-04').getTime(), 
      privacyStatus: true,
      autoRenew: false,
      transferLock: true,
    },
    {
      key: '3',
      domainName: 'dnsmanager.world',
      expirationDate: new Date('2027-08-27').getTime(), 
      privacyStatus: true,
      autoRenew: false,
      transferLock: true,
    },
    {
      key: '4',
      domainName: 'mydomain.com',
      expirationDate: new Date('2025-07-09').getTime(), 
      privacyStatus: true,
      autoRenew: true,
      transferLock: false,
    },
];

const ViewDomainTable: React.FC = () => {
    const [searchText, setSearchText] = useState<string>('');
    const [searchTextOfColumn, setSearchTextOfColumn] = useState<string>('');
    const [searchedColumn, setSearchedColumn] = useState<string>('');
    const searchInputOfColumn = useRef<InputRef>(null);
    const [viewChart, setViewChart] = useState<boolean>(false);
    const [chartData, setChartData] = useState<any[]>([]);

    const handleSearch = (
      selectedKeys: string[],
      confirm: (param?: FilterConfirmProps) => void,
      dataIndex: DataIndex,
    ) => {
      confirm();
      setSearchTextOfColumn(selectedKeys[0]);
      setSearchedColumn(dataIndex);
    };
    
    const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchTextOfColumn('');
    };

    const filteredData = data.filter(record =>
        record.domainName.toLowerCase().includes(searchText.toLowerCase()) ||
        record.autoRenew.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        record.transferLock.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        record.privacyStatus.toString().toLowerCase().includes(searchText.toLowerCase())
    );

    const monthsUntilExpiration = (expirationDate: number) => {
        const now = new Date();
        const expiryDate = new Date(expirationDate);
        return (expiryDate.getFullYear() - now.getFullYear()) * 12 + (expiryDate.getMonth() - now.getMonth());
    };
    
    const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
          <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
            <Input
              ref={searchInputOfColumn}
              placeholder={`Search ${dataIndex}`}
              value={`${selectedKeys[0] || ''}`}
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
        filterIcon: (filtered: boolean) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
          record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
          if (visible) {
            setTimeout(() => searchInputOfColumn.current?.select(), 100);
          }
        },
        render: (text, record) =>
          searchedColumn === dataIndex ? (
            <Highlighter 
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[searchTextOfColumn]}
              autoEscape
              textToHighlight={text ? text.toString() : ''}
            />
          ) : (
            dataIndex === 'autoRenew' || dataIndex === 'transferLock' || dataIndex === 'privacyStatus' ? (
              <span>{record[dataIndex] ? 'Enabled' : 'Disabled'}</span>
            ) : (
              dataIndex === 'expirationDate' ? (
                <span>{monthsUntilExpiration(record[dataIndex])}</span> 
              ) : (
                text
              )
            )
        ), 
    });

    const columns: ColumnsType<DataType> = [
        {
          title: 'Domain Name',
          dataIndex: 'domainName',
          key: 'domainName',
          ...getColumnSearchProps('domainName'),
          sorter: (a, b) => a.domainName.localeCompare(b.domainName),
          sortDirections: ['descend', 'ascend'],
        },
        {
          title: 'Months Until Expiration',
          dataIndex: 'expirationDate',
          key: 'monthsUntilExpiration',
          width: '20%',
          render: (text, record) => monthsUntilExpiration(record.expirationDate), 
          sorter: (a, b) => monthsUntilExpiration(a.expirationDate) - monthsUntilExpiration(b.expirationDate),
          sortDirections: ['descend', 'ascend'],
        },
        {
          title: 'Privacy Protection',
          dataIndex: 'privacyStatus',
          key: 'privacyStatus',
          ...getColumnSearchProps('privacyStatus'),
          sorter: (a, b) => a.privacyStatus === b.privacyStatus ? 0 : (a.privacyStatus ? 1 : -1), 
          sortDirections: ['descend', 'ascend'],
        },
        {
          title: 'Auto Renew',
          dataIndex: 'autoRenew',
          key: 'autoRenew',
          ...getColumnSearchProps('autoRenew'),
          sorter: (a, b) => a.autoRenew === b.autoRenew ? 0 : (a.autoRenew ? 1 : -1),
          sortDirections: ['descend', 'ascend'],
        },
        {
          title: 'Transfer Lock',
          dataIndex: 'transferLock',
          key: 'transferLock',
          ...getColumnSearchProps('transferLock'),
          sorter: (a, b) => a.transferLock === b.transferLock ? 0 : (a.transferLock ? 1 : -1),
          sortDirections: ['descend', 'ascend'],
        },
    ]; 

    const handleViewChart = () => {
      setViewChart(true);
  
      const dataForChart = data.map(domain => ({
        type: domain.domainName,
        value: monthsUntilExpiration(domain.expirationDate),
      }));
      
      setChartData(dataForChart);
    };
    
    return (
      <ViewTableOfDomain>
        {viewChart === true ? (
          <>
            <DomainChart chartData = {chartData} />
            <Button onClick={() => setViewChart(false)}>Back to Table</Button>
          </>
        ) : (
          <>
            <GlobalSearchOfTable>
              <ViewChartButton onClick={handleViewChart}>View Chart</ViewChartButton>
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
      </ViewTableOfDomain>
    );
};

export default ViewDomainTable;

const ViewTableOfDomain = styled.div`
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
