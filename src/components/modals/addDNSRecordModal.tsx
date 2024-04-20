import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Input, Select, message } from 'antd';
import AWS from 'aws-sdk'; // Import AWS SDK

const { Option } = Select;

type AddDNSRecordModalProps = {
  isDNSRecordModalOpen: boolean,
  onCancel: () => void,
}

const AddDNSRecordModal: React.FC<AddDNSRecordModalProps> = ({ isDNSRecordModalOpen, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm(); // Create form instance

  useEffect(() => {
    if (isDNSRecordModalOpen) {
      setIsModalOpen(true);
    }
  }, [isDNSRecordModalOpen]);

  const handleOk = () => {
    setLoading(true);
    // Submit the form data
    form
      .validateFields()
      .then(values => {
        // Initialize AWS Route53
        const route53 = new AWS.Route53({
          accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
          secretAccessKey: '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',
          region: 'us-east-1'
        });

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
          HostedZoneId: 'Z03475321WH1NH01XRPEQ' // Replace with your hosted zone ID
        };

        route53.changeResourceRecordSets(params, function(err, data) {
          if (err) {
            message.error('Failed to add DNS record');
            console.error('Error:', err);
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

  return (
    <div>
      <Modal
        visible={isModalOpen}
        title="Add Record"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Return
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
            Submit
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="domainName"
            label="Domain Name"
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
        </Form>
      </Modal>
    </div>
  );
};

export default AddDNSRecordModal;
