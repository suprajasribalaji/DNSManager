import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from 'antd';

const AWS = require("aws-sdk");

type AddDNSRecordModalProps = {
  isDNSRecordModalOpen: boolean,
  onCancel: () => void
}
const AddDNSRecordModal: React.FC <AddDNSRecordModalProps> = ({ isDNSRecordModalOpen, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if(isDNSRecordModalOpen) {
      setIsModalOpen(true);
    }
  }, [isDNSRecordModalOpen])

  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
    }, 3000);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onCancel();
  };

  const YOUR_HOSTED_ZONE_ID = 'Z03475321WH1NH01XRPEQ';

  useEffect(() => {
    AWS.config.update({
      accessKeyId: 'YOUR_ACCESS_KEY_ID',
      secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
      region: 'us-east-1'
    });

    const route53 = new AWS.Route53();

    const addDNSRecord = () => {
      const params = {
        ChangeBatch: {
          Changes: [
            {
              Action: 'CREATE',
              ResourceRecordSet: {
                Name: 'dnsmanager.live',
                Type: 'PTR',
                TTL: 340,
                ResourceRecords: [
                  { Value: "ns-1403.awsdns-47.org." },
                  { Value: "ns-826.awsdns-39.net." },
                  { Value: "ns-1990.awsdns-56.co.uk." },
                  { Value: "ns-314.awsdns-39.com." },
                ]
              }
            }
          ]
        },
        HostedZoneId: YOUR_HOSTED_ZONE_ID
      };

      route53.changeResourceRecordSets(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
      });
    };
    
    // Call the function to add DNS record
    addDNSRecord();

    // Clean up function
    return () => {
      // Any cleanup code, if needed
    };
  }, []);

  return (
    <div>
      <Modal
        visible={isModalOpen}
        title="Add Record"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel} >
            Return
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
            Submit
          </Button>,
        ]}
      >
        <Form>

        </Form>
      </Modal>
    </div>
  );
};

export default AddDNSRecordModal;
