import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Radio, message } from "antd";
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

    const [form] = Form.useForm(); 

    const route53 = new AWS.Route53({
        accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
        secretAccessKey: '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',
        region: 'us-east-1',
      });

    useEffect(() => {
        setIsModalOpen(isDomainModalOpen); // Simplified setting modal open state
    }, [isDomainModalOpen]);

    const handleOk = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const domainName = values.domainName + '.';
            
            const params = {
                CallerReference: domainName + uuidv4(),
                Name: domainName,
                HostedZoneConfig: {
                    PrivateZone: false
                }
            }
            
            await route53.createHostedZone(params).promise();
    
            message.success('Domain added successfully. Please, Refresh the page');
            console.log('Domain added successfully');
            setIsModalOpen(false);
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
                <StyledButton key="submit" type="link" loading={loading} onClick={handleOk}>
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
