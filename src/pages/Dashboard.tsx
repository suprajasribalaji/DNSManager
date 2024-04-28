import React, { useState } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Space } from 'antd';
import { styled } from 'styled-components';
import ViewRecordTable from '../components/record/viewRecordTable.tsx';
import ViewDomainTable from '../components/domain/viewDomainTable.tsx';
import AddDNSRecordModal from '../components/modals/addDNSRecordModal.tsx';
import { Buttons, PageDivisionBackground } from '../components/theme/color.tsx';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase-config";

const viewItems = [
    {
        label: 'Domain',
        key: 'Domain',
    },
    {
        label: 'Record',
        key: 'Record',
    },
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const [selectedViewMenu, setSelectedViewMenu] = useState<string>('Domain');
    const [isDNSRecordModalOpen, setIsDNSRecordModalOpen] = useState<boolean>(false);

    const handleViewDropdownItemClick = ({ key }: { key: string }) => {
        setSelectedViewMenu(key);
    };

    const handleAddDNSRecordModal = () => {
        setIsDNSRecordModalOpen(true);
    };

    const handleAddDNSRecordModalCancel = () => {
        setIsDNSRecordModalOpen(false);
        setSelectedViewMenu('Record');
    };

    const handleLogout = async () => {
        try {
          await signOut(auth); 
          navigate('/'); 
        } catch (error) {
          console.error('Error signing out:', error);
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
                            <Dropdown 
                                overlay={
                                    <Menu onClick={handleViewDropdownItemClick}>
                                        {viewItems.map(item => (
                                            <Menu.Item key={item.key}>{item.label}</Menu.Item>
                                        ))}
                                    </Menu>
                                }
                            >
                                <StyledButton type='link'>{selectedViewMenu}<CaretDownOutlined /></StyledButton>
                            </Dropdown>
                        </NavBarDropdownButton>
                        <NavBarDropdownButtonAndModal>
                            <StyledButton type='link' onClick={handleAddDNSRecordModal}>Add DNS Record</StyledButton>
                        </NavBarDropdownButtonAndModal>
                        <NavBarDropdownButtonAndModal>
                            <StyledButton type='link' onClick={handleLogout}>Logout</StyledButton>
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
                    : selectedViewMenu === 'Record' ? 
                        <ViewRecordTable /> 
                    : selectedViewMenu === 'Domain' ? 
                        <ViewDomainTable /> 
                    : <Message>To explore more about this page, check out the top of the page!</Message>
                }
            </ViewTableOfDomainOrRecord>
        </DashboardComponent>
    );
};

export default Dashboard;

const DashboardComponent = styled.div`
    height: 97.6vh;
    display: flex;
    flex-direction: column;
`;

const DashboardNavBar = styled.div`
    display: flex;
    background-color: ${PageDivisionBackground.navbarBg};
    padding: 10px;
`;

const NavBarHeading = styled.div`
    margin-right: auto;
`;

const NavBarItems = styled.div`
    display: flex;
`;

const NavBarDropdownButton = styled.div``;

const NavBarDropdownButtonAndModal = styled.div``;

const ViewTableOfDomainOrRecord = styled.div`
    flex: 1;
    padding-top: 1%;
    padding-left: 2%;
    padding-right: 2%;
    padding-bottom: 1%;
    background-color: ${PageDivisionBackground.division};
`;

const StyledButton = styled(Button)`
    background-color: ${Buttons.backgroundColor};
    color: ${Buttons.text};
    border: none;
    &&&:hover {
        color: ${Buttons.hover};
    }
`;

const Message = styled.span`
    font-size: 110%;
`;