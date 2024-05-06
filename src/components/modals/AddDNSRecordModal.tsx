import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Input, Select, message, Row, Col, Space, Alert } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import AWS from 'aws-sdk'; 
import styled from "styled-components";
import { Buttons } from "../theme/color.tsx";
const { v4: uuidv4 } = require('uuid');

const { Option } = Select;

type AddDNSRecordModalProps = {
  isDNSRecordModalOpen: boolean,
  onCancel: () => void,
}

const AddDNSRecordModal: React.FC<AddDNSRecordModalProps> = ({ isDNSRecordModalOpen, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [recordValues, setRecordValues] = useState<string[]>(['']);  
  const [showAlert, setShowAlert] = useState<boolean>(false); 
  const [form] = Form.useForm(); 

  const route53 = new AWS.Route53({
    accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
    secretAccessKey: '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',
    region: 'us-east-1',
  });

  useEffect(() => {
    setIsModalOpen(isDNSRecordModalOpen);
  }, [isDNSRecordModalOpen]);

  const handleAddDomain = async (domainName: string) => {
    try {
      const hostedZones = await route53.listHostedZonesByName().promise();
      const domainExists = hostedZones.HostedZones.some(zone => zone.Name === `${domainName}.`);
      console.log('domain exists ? ', domainExists);
      if (!domainExists) {
        const params = {
          CallerReference: domainName + uuidv4(),
          Name: domainName,
          HostedZoneConfig: {
            PrivateZone: false
          }
        };
        await route53.createHostedZone(params).promise();
        console.log('Domain added successfully!');
      }
      return domainExists;
    } catch (error) {
      console.log('Error adding domain:', error);
      return false;
    }
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      form.validateFields().then(async values => {
        let domainName = values.domainName;
        let hostedZoneId;
        
        const domainExists = await handleAddDomain(domainName);
        console.log('Domain exists:', domainExists);

        if (!domainExists) {
          setShowAlert(true);
          setLoading(false); // Set loading to false here to enable the modal interaction
        } else {
          // Directly add the DNS record
          // Continue with adding the DNS record
          const hostedZonesByName = await route53.listHostedZonesByName().promise();
          console.log('hosted zone by name : ', hostedZonesByName);
          
          const zones = hostedZonesByName.HostedZones;
          console.log('zones: ', zones);

          domainName = domainName.endsWith('.') ? domainName : domainName + '.';
          console.log('domain name: ', domainName);
          
          for(let i=0;i<zones.length;i++) {
            if( zones[i].Name === domainName ) {
              hostedZoneId = zones[i].Id;
              break;
            }
          }

          console.log('hosted zone id: ', hostedZoneId);
          
          const params = {
            ChangeBatch: {
              Changes: [
                {
                  Action: 'CREATE',
                  ResourceRecordSet: {
                    Name: domainName.endsWith('.') ? domainName : domainName + '.',
                    Type: values.recordType,
                    TTL: parseInt(values.ttl, 10),
                    ResourceRecords: recordValues.map(value => ({ Value: value })),
                  },
                },
              ],
            },
            HostedZoneId: hostedZoneId || ''
          };

          await route53.changeResourceRecordSets(params, function (err, data) {
            if (err) {
              setLoading(false);
              message.error('Failed to add DNS record!');
              console.error('Error adding DNS record:', err);
            } else {
              message.success('DNS record added successfully. Please, refresh the page');
              setLoading(false);
              setIsModalOpen(false);
              form.resetFields();
            }
          });
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onCancel();
  };

  const handleAddRecordValue = () => {
    setRecordValues([...recordValues, '']);
  };

  const handleRecordValueChange = (index: number, value: string) => {
    const newRecordValues = [...recordValues];
    newRecordValues[index] = value;
    setRecordValues(newRecordValues);
  };

  const handleDeleteRecordValue = (indexToRemove: number) => {
    const newRecordValues = [...recordValues];
    newRecordValues.splice(indexToRemove, 1);
    setRecordValues(newRecordValues);
  };

  const handleAlertCancel = () => {
    setShowAlert(false);
    setIsModalOpen(false); // Close the modal if the user declines the alert
  };

  return (
    <div>
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
          <Form.Item
            name="recordType"
            label="Record Type"
            rules={[{ required: true, message: 'Please select the record type' }]}
          >
            <Select placeholder="Select the record type">
              <Option value="PTR">PTR</Option>
              <Option value="CAA">CAA</Option>
              <Option value="TXT">TXT</Option>
              <Option value="MX">MX</Option>
              <Option value="SRV">SRV</Option>
            </Select>
          </Form.Item>
          {recordValues.map((value, index) => (
            <Form.Item
              key={index}
              label={`Record Value`}
              rules={[{ required: true, message: 'Please enter the record value' }]}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Input
                    placeholder="Enter the record value"
                    value={value}
                    onChange={(e) => handleRecordValueChange(index, e.target.value)}
                  />
                </Col>
                <Col>
                  <StyledButton type="link" onClick={() => handleDeleteRecordValue(index)}>Delete</StyledButton> {/* Delete button */}
                </Col>
              </Row>
            </Form.Item>
          ))}
          <Row justify="end">
            <Col>
              <StyledButton type="link" onClick={handleAddRecordValue}>Add Record Value <PlusOutlined /></StyledButton>
            </Col>
          </Row>
          <Form.Item
            name="ttl"
            label="TTL (seconds)"
            rules={[{ required: true, message: 'Please enter the TTL in seconds' }]}
          >
            <Input type="number" placeholder="Enter the TTL in seconds" />
          </Form.Item>
        </CustomForm>
        {showAlert && (
          <Alert
            message="Are you sure?"
            description="New Domain name found! Still want to create with this name?"
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
    </div>
  );
};

export default AddDNSRecordModal;

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
