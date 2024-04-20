import React, { useState } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Modal, Space, type MenuProps } from 'antd';
import { styled } from 'styled-components';
import ViewRecordTable from '../components/record/viewRecordTable.tsx';
import ViewDomainTable from '../components/domain/viewDomainTable.tsx';
import AddDNSRecordModal from '../components/modals/addDNSRecordModal.tsx';
import DeleteDNSRecordModal from '../components/modals/deleteDNSRecordModal.tsx';
import EditDNSRecordModal from '../components/modals/editDNSRecordModal.tsx';

const viewItems: MenuProps['items'] = [
    {
        label: 'Domain',
        key: '0',
    },
    {
        label: 'Record',
        key: '1',
    },
];

const dnsRecordItems: MenuProps['items'] = [
    {
        label: 'Add',
        key: '0',
    },
    {
        label: 'Delete',
        key: '1',
    },
    {
        label: 'Edit',
        key: '2',
    },
];

const Dashboard: React.FC = () => {
    const [selectedViewMenu, setSelectedViewMenu] = useState<string>('');
    const [selectedUploadMenu, setSelectedUploadMenu] = useState<string>('');
    const [selectedDNSRecordMenu, setSelectedDNSRecordMenu] = useState<string>('');
    const [isDNSRecordModalOpen, setIsDNSRecordModalOpen] = useState<boolean>(false);

    const handleViewDropdownItemClick: MenuProps['onClick'] = ({ key }) => {
        if(key === '1') {
            setSelectedViewMenu('Record');
        } else {
            setSelectedViewMenu('Domain');
        }    
    };

    const handleUploadDropdownItemClick: MenuProps['onClick'] = ({ key }) => {
        if(key === '1') {
            setSelectedUploadMenu('Record');
        } else {
            setSelectedUploadMenu('Domain');
        }    
    };

    const handleDNSRecordDropdownItemClick: MenuProps['onClick'] = ({ key }) => {
        if(key === '0') {
            setSelectedDNSRecordMenu('Add');
            setIsDNSRecordModalOpen(true);
        } else if (key === '1') {
            setSelectedDNSRecordMenu('Delete');
            setIsDNSRecordModalOpen(true);
        } else {
            setSelectedDNSRecordMenu('Edit');
            setIsDNSRecordModalOpen(true);
        }
    };

    return (
        <DashboardComponent>
            <DashboardNavBar>
                <NavBarHeading>
                    <h3>DNS MANAGER</h3>
                </NavBarHeading>
                <NavBarItems>
                    <Space>
                        <NavBarDropdownButton>
                            <Dropdown menu = {{
                                 items: viewItems,
                                 onClick: handleViewDropdownItemClick,
                            }}>
                                <Space>
                                <Button onClick={(e) => e.preventDefault()}>View<CaretDownOutlined /></Button>
                                </Space>
                            </Dropdown>
                        </NavBarDropdownButton>
                        <NavBarDropdownButton>
                        <Dropdown menu={{ 
                            items: viewItems,
                            onClick: handleUploadDropdownItemClick, 
                        }}>
                            <Space>
                                <Button onClick={(e) => e.preventDefault()}>Upload<CaretDownOutlined /></Button>
                            </Space>
                        </Dropdown>
                        </NavBarDropdownButton>
                        <NavBarDropdownButtonAndModal>
                            <Dropdown menu={{ 
                                items: dnsRecordItems,
                                onClick: handleDNSRecordDropdownItemClick, 
                            }}>
                                <Space>
                                    <Button onClick={(e) => e.preventDefault()}>DNS Record<CaretDownOutlined /></Button>
                                </Space>
                            </Dropdown>
                        </NavBarDropdownButtonAndModal>
                    </Space>
                </NavBarItems>
            </DashboardNavBar>            
            <ViewTableOfDomainOrRecord>
                { 
                    selectedViewMenu === 'Record' ? <ViewRecordTable /> : 
                    selectedViewMenu === 'Domain' ? <ViewDomainTable /> : (
                        <>
                            {
                                selectedDNSRecordMenu === 'Add' ? <AddDNSRecordModal isDNSRecordModalOpen = {isDNSRecordModalOpen} /> :
                                <>
                                    <span>
                                        To explore more about this page, check out the top of the page!
                                    </span>
                                </>
                            }                              
                        </>
                )}                
            </ViewTableOfDomainOrRecord>
        </DashboardComponent>
    );
};

export default Dashboard;

const DashboardComponent = styled.div`
    height: 100vh;
    weight: 100%;
`;

const DashboardNavBar = styled.div`
    display: flex;
`;

const NavBarHeading = styled.div`
    margin-left: 1%;
`;

const NavBarItems = styled.div`
    display: flex;
    margin-left: 70%;
`;

const NavBarDropdownButton = styled.div``;

const NavBarDropdownButtonAndModal = styled.div``;

const ViewTableOfDomainOrRecord = styled.div`
    margin-top: 2%;
`;