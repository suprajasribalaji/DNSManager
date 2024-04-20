import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Modal, Space } from 'antd';
import { styled } from 'styled-components';
import ViewRecordTable from '../components/record/viewRecordTable.tsx';
import ViewDomainTable from '../components/domain/viewDomainTable.tsx';
import AddDNSRecordModal from '../components/modals/addDNSRecordModal.tsx';

const viewItems = [
    {
        label: 'Domain',
        key: 'domain',
    },
    {
        label: 'Record',
        key: 'record',
    },
];

const Dashboard: React.FC = () => {
    const [selectedViewMenu, setSelectedViewMenu] = useState<string>('');
    const [isDNSRecordModalOpen, setIsDNSRecordModalOpen] = useState<boolean>(false);

    const handleViewDropdownItemClick = ({ key }: { key: string }) => {
        setSelectedViewMenu(key);
    };

    const handleAddDNSRecordModal = () => {
        setIsDNSRecordModalOpen(true);
    };

    const handleAddDNSRecordModalCancel = () => {
        setIsDNSRecordModalOpen(false);
        setSelectedViewMenu('record');
    }

    return (
        <DashboardComponent>
            <DashboardNavBar>
                <NavBarHeading>
                    <h3>DNS MANAGER</h3>
                </NavBarHeading>
                <NavBarItems>
                    <Space>
                        <NavBarDropdownButton>
                            <Dropdown 
                                menu={{
                                    items: viewItems,
                                    onClick: handleViewDropdownItemClick,
                                }}
                            >
                                <Button onClick={(e) => e.preventDefault()}>View<CaretDownOutlined /></Button>
                            </Dropdown>
                        </NavBarDropdownButton>
                        <NavBarDropdownButtonAndModal>
                            <Button onClick={handleAddDNSRecordModal}>Add DNS Record</Button>
                        </NavBarDropdownButtonAndModal>
                    </Space>
                </NavBarItems>
            </DashboardNavBar>            
            <ViewTableOfDomainOrRecord>
                {
                    isDNSRecordModalOpen ? 
                        (
                            <>
                                <AddDNSRecordModal 
                                    isDNSRecordModalOpen={isDNSRecordModalOpen} 
                                    onCancel={handleAddDNSRecordModalCancel} 
                                /> 
                                <ViewRecordTable />
                            </>
                        )
                    : selectedViewMenu === 'record' ? 
                        <ViewRecordTable /> 
                    : selectedViewMenu === 'domain' ? 
                        <ViewDomainTable /> 
                    : <span>To explore more about this page, check out the top of the page!</span>
                }
            </ViewTableOfDomainOrRecord>
        </DashboardComponent>
    );
};

export default Dashboard;

const DashboardComponent = styled.div`
    height: 100vh;
    width: 100%;
`;

const DashboardNavBar = styled.div`
    display: flex;
`;

const NavBarHeading = styled.div`
    margin-left: 1%;
    margin-right: auto;
`;

const NavBarItems = styled.div`
    display: flex;
    margin-right: 0.8%;
`;

const NavBarDropdownButton = styled.div``;

const NavBarDropdownButtonAndModal = styled.div``;

const ViewTableOfDomainOrRecord = styled.div`
    margin-top: 2%;
`;
