import React, { useState, useEffect } from "react";
import { Button, Modal, message } from 'antd';
import AWS from 'aws-sdk';

type DeleteDNSRecordModalProps = {
  isDeleteButtonClicked: boolean,
  onCancel: () => void,
  hostedZoneId: string,
  recordName: string,
  recordType: string,
}

const DeleteDNSRecordModal: React.FC<DeleteDNSRecordModalProps> = ({ isDeleteButtonClicked, onCancel, hostedZoneId, recordName, recordType }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDeleteButtonClicked) {
      setIsModalOpen(true);
    }
  }, [isDeleteButtonClicked]);

  const handleOk = () => {
    setLoading(true);
    const route53 = new AWS.Route53({
      accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
      secretAccessKey: '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',
      region: 'us-east-1'
    });

    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'DELETE',
            ResourceRecordSet: {
              Name: recordName,
              Type: recordType,
            }
          }
        ]
      },
      HostedZoneId: hostedZoneId,
    };

    route53.changeResourceRecordSets(params, function(err, data) {
      if (err) {
        message.error('Failed to delete DNS record');
        console.error('Error:', err);
      } else {
        message.success('DNS record deleted successfully');
        setLoading(false);
        setIsModalOpen(false);
      }
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
        title="Delete Record"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel} >
            Return
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete the DNS record?</p>
      </Modal>
    </div>
  );
};

export default DeleteDNSRecordModal;
