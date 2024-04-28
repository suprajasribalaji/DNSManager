import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Input, Select, message, Row, Col } from 'antd';
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
  const [isDomainExist, setIsDomainExist] = useState<boolean>(true);
  const [form] = Form.useForm(); 

  const route53 = new AWS.Route53({
    accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
    secretAccessKey: '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',
    region: 'us-east-1'
  });

  useEffect(() => {
    if (isDNSRecordModalOpen) {
      setIsModalOpen(true);
    }
  }, [isDNSRecordModalOpen]);

  const handleOk = async () => {
    setLoading(true);
    const hostedZones = await route53.listHostedZonesByName().promise();
    form
      .validateFields()
      .then(values => {
        const hostedZoneId = hostedZones.HostedZones.find(zone => zone.Name === values.domainName)?.Id;
        console.log('id: ', hostedZoneId);
        
        const params = {
          ChangeBatch: {
            Changes: [
              {
                Action: 'CREATE',
                ResourceRecordSet: {
                  Name: values.domainName,
                  Type: values.recordType,
                  TTL: parseInt(values.ttl, 10), 
                  ResourceRecords: [
                    { Value: values.recordValue }
                  ]
                }
              }
            ]
          },
          HostedZoneId: hostedZoneId || ''
        };

        route53.changeResourceRecordSets(params, function(err, data) {
          if (err) {
            message.error('Failed to add DNS record, Please check all the inputs!');
            console.error('Error:', err);
            setLoading(false);
          } else {
            message.success('DNS record added successfully. Please, refresh the page');
            setLoading(false);
            setIsModalOpen(false);
            form.resetFields(); 
          }
        });
      })
      .catch(error => {
        console.log('Validation failed:', error);
        setLoading(false);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onCancel();
  };

  const isDomainExists = async ()  => { 
    const hostedZones = await route53.listHostedZonesByName().promise();
        
    const domains: string[] = [];
    for (let i = 0; i < hostedZones.HostedZones.length; i++) {
      let domain = hostedZones.HostedZones[i].Name;
      domains.push(domain);
      if (domain.endsWith('.')) {
        domain = domain.slice(0, -1);
      }
      domains.push(domain);
    }    
    
    const domainName = form.getFieldValue('domainName');
      if(domains.includes(domainName)) {
        message.warning('Exists!')
        setIsDomainExist(true)
      } else {
        message.success('Not exists!!')
        setIsDomainExist(false)
      }
    }

    const handleAddDomain = () => {
      if ( !isDomainExist ) {
        try {
          const domainName = form.getFieldValue('domainName')
          const route53 = new AWS.Route53();
          const params = {
            CallerReference: domainName + uuidv4(),
            Name: domainName,
            HostedZoneConfig: {
              PrivateZone: false
            }
          }
          route53.createHostedZone(params, function(err, data) {
            if(err) {
              message.error('Failed to add!')
              console.log('Error: ', err);
            } else {
              message.success('Domain Added Successfully!')
              console.log('Success: ', data);
            }
          })          
        } catch (error) {
          message.error('Failed to add!')
          console.log('error at add domain: ', error); 
        }
      }
    }

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
          <Form.Item label="Domain Name" name="domainName" rules={[{ required: true, message: 'Please enter the domain name' }]}>
            <Row justify="space-between" align="middle"> 
              <Col> <Input placeholder="Enter the domain name" /> </Col> 
              <Col> <StyledButton type="link" onClick={isDomainExists}>Is Exists?</StyledButton> </Col>
              <Col> <StyledButton type="link" onClick={handleAddDomain} disabled={isDomainExist}>Add Domain!</StyledButton> </Col> 
            </Row> 
          </Form.Item>
          <Form.Item
            name="recordType"
            label="Record Type"
            rules={[{ required: true, message: 'Please select the record type' }]}
          >
            <Select placeholder="Select the record type">
              <Option value="PTR">PTR</Option>
              <Option value="SPF">SPF</Option>
              <Option value="TXT">TXT</Option>
              <Option value="MX">MX</Option>
              <Option value="SRV">SRV</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="recordValue"
            label="Record Value"
            rules={[{ required: true, message: 'Please enter the record value' }]}
          >
            <Input placeholder="Enter the record value" />
          </Form.Item>
          <Form.Item
            name="ttl"
            label="TTL (seconds)"
            rules={[{ required: true, message: 'Please enter the TTL in seconds' }]}
          >
            <Input type="number" placeholder="Enter the TTL in seconds" />
          </Form.Item>
        </CustomForm>
      </Modal>
    </div>
  );
};

export default AddDNSRecordModal;

const StyledButton = styled(Button)`
  background-color: ${Buttons.backgroundColor};
  color: ${Buttons.text};
  border: none;
  &&&:hover,
  &&&:focus {
      color: ${Buttons.hover};
  }
`;

const CustomForm = styled(Form)`
  margin-top: 5%;
`;
