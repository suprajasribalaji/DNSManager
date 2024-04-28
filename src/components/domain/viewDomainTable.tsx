import React, { useEffect,  useState } from 'react';
import { Button, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { styled } from 'styled-components';
import DomainChart from '../charts/domainChart.tsx';
import { Buttons } from '../theme/color.tsx';
import AWS from 'aws-sdk';
import { SearchProps } from 'antd/es/input/Search';

interface DataType {
  key: React.Key;
  Id: string;
  Name: string;
  ResourceRecordSetCount: number;
  PrivateZone: boolean;
}

const ViewDomainTable: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [viewChart, setViewChart] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [hostedZones, setHostedZones] = useState<any[]>([]);
  const [searchedData, setSearchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const route53 = new AWS.Route53({
      accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
      secretAccessKey: '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',
      region: 'us-east-1',
    });
    fetchHostedZones();
    async function fetchHostedZones() {
      try {
        const data = await route53.listHostedZones().promise();
        if (data.HostedZones) {
          setHostedZones(data.HostedZones);
          console.log('Fetched successfully!');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching hosted zones:', error);
        setLoading(false);
      }
    }
  }, []);
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'Domain Name',
      dataIndex: 'Name',
      key: 'Name',
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Hosted Zone Id',
      dataIndex: 'Id',
      key: 'Id',
      sorter: (a, b) => a.Id.localeCompare(b.Id),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Resource Record Set Count',
      dataIndex: 'ResourceRecordSetCount',
      key: 'ResourceRecordSetCount',
      sorter: (a, b) => b.ResourceRecordSetCount - a.ResourceRecordSetCount,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Private Zone',
      dataIndex: 'PrivateZone',
      key: 'PrivateZone',
      render: (text) => (<span>{text === 'true' ? 'Yes' : 'No'}</span>),
      sorter: (a, b) => (a.PrivateZone === b.PrivateZone ? 0 : a.PrivateZone ? 1 : -1),
      sortDirections: ['descend', 'ascend'],
    },
  ];

  const onSearch: SearchProps['onSearch'] = (value) => {
    console.log(value)
    setSearchText(value)
    const filterTable = hostedZones.filter(o =>
      Object.keys(o).some(k =>
        String(o[k])
          .toLowerCase()
          .includes(value.toLowerCase())
      )
    );
    setSearchedData(filterTable)
  }

  const filteredData = hostedZones.filter(record => 
    record.Name.toLowerCase().includes(searchText.toLowerCase()) ||
    record.Id.toLowerCase().includes(searchText.toLowerCase()) ||
    record.ResourceRecordSetCount.toString().toLowerCase().includes(searchText.toLowerCase()) ||
    record.PrivateZone.toString().toLowerCase().includes(searchText.toLowerCase())
  )

  const handleViewChart = () => {
    setViewChart(true);

    const dataForChart = hostedZones.map((domain) => ({
      type: domain.Name,
      value: domain.ResourceRecordSetCount,
    }));

    setChartData(dataForChart);
  };

  return (
    <ViewTableOfDomain>
      {viewChart === true ? (
        <>
          <DomainChart chartData={chartData} />
          <StyledButton type="link" onClick={() => setViewChart(false)}>
            Back to Table
          </StyledButton>
        </>
      ) : (
        <>
          <GlobalSearchAndViewChart>
            <ViewChartButton onClick={handleViewChart}>View Chart</ViewChartButton>
            <GlobalSearchOfTable
                  placeholder="Search"
                  allowClear 
                  onChange={(e) => setSearchText(e.target.value)} 
              />
            </GlobalSearchAndViewChart>
            <ViewContentOfTable>
                <ContentOfTable
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
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

const GlobalSearchAndViewChart = styled.div`
  display: flex;
`;

const GlobalSearchOfTable = styled(Input)`
  width: 12%;
  margin-bottom: 1%;
  justify-content: flex-end;
`;

const ViewContentOfTable = styled.div`
  margin: 0.4%;
`;

const ContentOfTable = styled(Table)<{ columns: ColumnsType<DataType>; dataSource: DataType[] }>``;

