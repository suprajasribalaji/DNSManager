import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Modal, Radio, Space, message } from "antd";
import AWS from 'aws-sdk'; 
import styled from "styled-components";
import { Buttons } from "../theme/color.tsx";
const { v4: uuidv4 } = require('uuid');

type AddDomainModalProps = {
    isDomainModalOpen: boolean,
    onCancel: () => void,
}

const AddDomainModal : React.FC<AddDomainModalProps> = ({ isDomainModalOpen, onCancel }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const [form] = Form.useForm(); 

    const route53 = new AWS.Route53({
    accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
    secretAccessKey: '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',
    region: 'us-east-1',
    });

    useEffect(() => {
        setIsModalOpen(isDomainModalOpen);
    }, [isDomainModalOpen]);

    const handleOk = async () => {
        setLoading(true);
        try {
            if (showAlert) { 
                const values = await form.validateFields();
                let domainName = values.domainName;
                if (!domainName.endsWith('.')){
                    domainName = domainName + '.';
                }
                
                const params = {
                    CallerReference: domainName + uuidv4(),
                    Name: domainName.endsWith('.') ? domainName : domainName + '.',
                    HostedZoneConfig: {
                        PrivateZone: false
                    }
                }
                
                await route53.createHostedZone(params).promise();
        
                message.success('Domain added successfully. Please, Refresh the page');
                setIsModalOpen(false);
                setLoading(false);
            } else { 
                setIsModalOpen(false);
            }
        } catch (error) {
            setLoading(false);
            message.error(`${error}`);
            console.log('Error adding domain:', error);
        } 
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        onCancel();
    };

    const handleAlertCancel = () => {
        setShowAlert(false); 
        setIsModalOpen(false);
    };

    return (
        <Modal
            visible={isModalOpen}
            title="DNS RECORD"
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    Return
                </Button>,
                <StyledButton key="submit" type="link" loading={loading} onClick={() => setShowAlert(true)}>
                    Add
                </StyledButton>,
            ]}
        >
            <CustomForm form={form} layout="vertical">
                <Form.Item 
                    label="Domain Name"  
                    name="domainName" 
                    rules={[{ required: true, message: 'Please enter the domain name' }]}
                >
                    <Input placeholder="Enter the domain name" />  
                </Form.Item>
            </CustomForm>
            {showAlert && (
                <Alert
                    message="Are you sure?"
                    description="Already Exists! Still want to create with same name?"
                    type="info"
                    action={
                        <Space direction="vertical">
                            <StyledButton size="small" type="link" onClick={handleOk}>Accept</StyledButton>
                            <Button size="small" danger ghost onClick={handleAlertCancel}>Decline</Button>
                        </Space>
                    }
                    closable
                    onClose={handleAlertCancel}
                />
            )}
        </Modal>
    )
};

export default AddDomainModal;

const StyledButton = styled(Button)`
    background-color: ${Buttons.backgroundColor};
    color: ${Buttons.text};
    border: none;
    &&&:hover {
        color: ${Buttons.hover};
    }
`;

const CustomForm = styled(Form)`
    margin-top: 5%;
`;
