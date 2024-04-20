import React, { useState, useEffect } from "react";
import { Button, Modal } from 'antd';

type DeleteDNSRecordModalProps = {
  isDeleteButtonClicked: boolean,
  onCancel: () => void,
}

const DeleteDNSRecordModal: React.FC<DeleteDNSRecordModalProps> = ({ isDeleteButtonClicked, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDeleteButtonClicked) {
      setIsModalOpen(true);
    }
  }, [isDeleteButtonClicked]);

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
        <p>Are you sure to delete?</p>
      </Modal>
    </div>
  );
};

export default DeleteDNSRecordModal;
