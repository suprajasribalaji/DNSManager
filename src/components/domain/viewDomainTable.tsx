import React, { useEffect,  useState } from 'react';
import { Button, Input, Popconfirm, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { styled } from 'styled-components';
import DomainChart from '../charts/domainChart.tsx';
import { Buttons } from '../theme/color.tsx';
import AWS from 'aws-sdk';
import { SearchProps } from 'antd/es/input/Search';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Search } = Input;

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
  const [loading, setLoading] = useState<boolean>(true);

  const route53 = new AWS.Route53({
    accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
    secretAccessKey: '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',
    region: 'us-east-1',
  });

  useEffect(() => {
    fetchHostedZones();
    async function fetchHostedZones() {
      try {
        const data = await route53.listHostedZones().promise();
        if (data.HostedZones) {
          setHostedZones(data.HostedZones);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    }
  }, []);
  
  const handleDeleteDomainRow = async (record: DataType) => {
    try {
      const { ResourceRecordSets } = await route53.listResourceRecordSets({ HostedZoneId: record.Id }).promise();

    // Filter out NS and SOA record sets
    const recordSetsToDelete = ResourceRecordSets.filter(rrs => !['NS', 'SOA'].includes(rrs.Type));

    // Delete each non-NS and non-SOA resource record set
    await Promise.all(recordSetsToDelete.map(async (rrs) => {
      await route53.changeResourceRecordSets({
        HostedZoneId: record.Id,
        ChangeBatch: {
          Changes: [
            {
              Action: 'DELETE',
              ResourceRecordSet: rrs
            }
          ]
        }
      }).promise();
    }));
      await route53.deleteHostedZone({ Id: record.Id }).promise();
      setHostedZones(hostedZones.filter(zone => zone.Id !== record.Id));
      message.success('Hosted zone deleted successfully');
    } catch (error) {
      console.error('Error deleting hosted zone:', error);
      message.error(`${error}`);
    }
  }

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
      render: (text) => (<span>{text === 'true' ? 'True' : 'False'}</span>),
      sorter: (a, b) => (a.PrivateZone === b.PrivateZone ? 0 : a.PrivateZone ? 1 : -1),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Actions',
      dataIndex: 'DeleteOrEdit',
      key: 'DeleteOrEdit',
      render: (_, record) => (
        <>
          <Popconfirm
            title="Are you sure to delete?"
            okText="Sure"
            cancelText="Return"
            onConfirm={() => handleDeleteDomainRow(record)}
          >
            <StyledDeleteButton type='link' icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
      align: 'center',
    }
  ];

  const onSearch: SearchProps['onSearch'] = (value) => {
    setSearchText(value)
  }

  const filteredData = hostedZones.filter(record => {
    return (
      record.Name.toLowerCase().includes(searchText.toLowerCase()) ||
      record.Id.toLowerCase().includes(searchText.toLowerCase()) ||
      record.ResourceRecordSetCount.toString().toLowerCase().includes(searchText.toLowerCase()) ||
      record.Config.PrivateZone.toString().toLowerCase().includes(searchText.toLowerCase())
    );
  });
  
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
                  onChange={(e) => onSearch(e.target.value)} 
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

const GlobalSearchOfTable = styled(Search)`
  width: 12%;
  margin-bottom: 1%;
  justify-content: flex-end;
  margin-left: 72%;
`;

const ViewContentOfTable = styled.div`
  margin: 0.4%;
`;

const ContentOfTable = styled(Table)<{ columns: ColumnsType<DataType>; dataSource: DataType[] }>``;

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