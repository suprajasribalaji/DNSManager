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
    expirationDate: string;
    autoRenew: boolean;
    transferLock: boolean;
}

const data: DataType[] = [
    {
      key: '1',
      domainName: 'dnsmanager.live',
      expirationDate: 'November 1, 2025',
      privacyStatus: true,
      autoRenew: true,
      transferLock: false,
    },
    {
      key: '2',
      domainName: 'dnsmanager.com',
      expirationDate: 'April 4, 2024',
      privacyStatus: true,
      autoRenew: false,
      transferLock: true,
    },
    {
      key: '3',
      domainName: 'dnsmanager.world',
      expirationDate: 'August 27, 2027',
      privacyStatus: true,
      autoRenew: false,
      transferLock: true,
    },
    {
      key: '4',
      domainName: 'mydomain.com',
      expirationDate: 'July 9, 2025',
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

    const handleViewChart = (value: boolean) => {
      setViewChart(value);
    }

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
        record.expirationDate.toLowerCase().includes(searchText.toLowerCase()) ||
        record.autoRenew.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        record.transferLock.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        record.privacyStatus.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    
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
              text
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
          title: 'Expiration Date',
          dataIndex: 'expirationDate',
          key: 'expirationDate',
          width: '20%',
          ...getColumnSearchProps('expirationDate'),
          sorter: (a, b) => a.expirationDate.localeCompare(b.expirationDate),
          sortDirections: ['descend', 'ascend'],
        },
        {
          title: 'Privacy Protection',
          dataIndex: 'privacyStatus',
          key: 'privacyStatus',
          ...getColumnSearchProps('privacyStatus'),
          sortDirections: ['descend', 'ascend'],
        },
        {
          title: 'Auto Renew',
          dataIndex: 'autoRenew',
          key: 'autoRenew',
          ...getColumnSearchProps('autoRenew'),
        },
        {
          title: 'Transfer Lock',
          dataIndex: 'transferLock',
          key: 'transferLock',
          ...getColumnSearchProps('transferLock'),
        },
    ]; 

    return (
      <ViewTableOfDomain>
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
