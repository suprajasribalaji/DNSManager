import React, { useEffect, useState } from "react";
import { Button, Modal } from 'antd';

type EditDNSRecordModalProps = {
  isEditButtonClicked: boolean,
  onCancel: () => void,
}
const EditDNSRecordModal: React.FC<EditDNSRecordModalProps> = ({ isEditButtonClicked, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isEditButtonClicked) {
      setIsModalOpen(true);
    }
  }, [isEditButtonClicked]);

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

  return (
    <div>
      <Modal
        visible={isModalOpen}
        title="Edit Record"
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
       <p>Are you sure to edit the record?</p>
      </Modal>
    </div>
  );
};

export default EditDNSRecordModal;
