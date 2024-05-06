import React, { useEffect, useState } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Space } from 'antd';
import { styled } from 'styled-components';
import ViewRecordTable from '../components/record/viewRecordTable.tsx';
import ViewDomainTable from '../components/domain/viewDomainTable.tsx';
import AddDNSRecordModal from '../components/modals/AddDNSRecordModal.tsx';
import { Buttons, PageDivisionBackground } from '../components/theme/color.tsx';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase-config";
import AddDomainModal from '../components/modals/AddDomainModal.tsx';

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

const addItems = [
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

    const [selectedViewMenu, setSelectedViewMenu] = useState<string>('View');
    const [selectedAddMenu , setSelectedAddMenu] = useState<string>('Add');
    const [isDNSRecordModalOpen, setIsDNSRecordModalOpen] = useState<boolean>(false);
    const [isDomainModalOpen, setIsDomainModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if( selectedAddMenu === 'Record' ) {
            setIsDNSRecordModalOpen(true);
        } else if (selectedAddMenu === 'Domain' ) {
            setIsDomainModalOpen(true);
        }
    }, [selectedAddMenu])
    
    const handleViewDropdownItemClick = ({ key }: { key: string }) => {
        setSelectedViewMenu(key);
    };

    const handleAddDropdownItemClick = ({ key }: { key: string }) => {
        setSelectedAddMenu(key);
    }

    const handleAddDomainModalCancel = () => {
        setIsDomainModalOpen(false);
        setSelectedViewMenu('Domain');
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
                        <Dropdown 
                                overlay={
                                    <Menu onClick={handleAddDropdownItemClick}>
                                        {addItems.map(item => (
                                            <Menu.Item key={item.key}>{item.label}</Menu.Item>
                                        ))}
                                    </Menu>
                                }
                            >
                                <StyledButton type='link'>{selectedAddMenu}<CaretDownOutlined /></StyledButton>
                            </Dropdown>
                        </NavBarDropdownButtonAndModal>
                        <NavBarDropdownButtonAndModal>
                            <StyledButton type='link' onClick={handleLogout}>Logout</StyledButton>
                        </NavBarDropdownButtonAndModal>
                    </Space>
                </NavBarItems>
            </DashboardNavBar>            
            <ViewTableOfDomainOrRecord>
                {
                    (selectedAddMenu === 'Record' && isDNSRecordModalOpen) ?
                        <>
                            <AddDNSRecordModal 
                                isDNSRecordModalOpen={isDNSRecordModalOpen} 
                                onCancel={handleAddDNSRecordModalCancel} 
                            />
                            <ViewRecordTable />
                        </>
                    : (selectedAddMenu === 'Domain' && isDomainModalOpen) ?
                        <>
                            <AddDomainModal 
                                isDomainModalOpen={isDomainModalOpen} 
                                onCancel={handleAddDomainModalCancel} 
                            />
                            <ViewDomainTable />
                        </>
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