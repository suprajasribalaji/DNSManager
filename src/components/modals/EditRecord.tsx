import { Button, Form, Input, Modal, Select, Switch, Tooltip, message } from "antd";
import React, { Dispatch, SetStateAction, useState } from "react";
import styled from "styled-components";
import { Buttons } from "../theme/color.tsx";
import { Option } from "antd/es/mentions/index";
import AWS from 'aws-sdk';

interface DataType {
    key: React.Key;
    recordName: string;
    recordType: string;
    routingPolicy?: string;
    differentiator?: string;
    alias: string;
    valueOrRouteTrafficTo: string[];
    ttlInSeconds: number;
    healthCheckId?: string;
    evaluateTargetHealth?: string;
    recordId?: string;
}

type EditRecordProps = {
    record: DataType | undefined,
    isEditModalOpen: boolean,
    setIsEditModalOpen: Dispatch<SetStateAction<boolean>>
}

const EditRecord: React.FC<EditRecordProps> = ({ record, isEditModalOpen, setIsEditModalOpen }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isAliasChecked, setIsAliasChecked] = useState<boolean>(record?.alias === 'No' ? false : true);
    const [recordRoutingPolicy, setRecordRoutingPolicy] = useState<string | undefined>(record?.routingPolicy);

    const [form] = Form.useForm();

    const route53 = new AWS.Route53({
        accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
        secretAccessKey: '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',
        region: 'us-east-1'
    });

    const handleCancel = () => {
        setIsEditModalOpen(false);
    }

    const handleEdit = async () => {
        setLoading(true);
        try {
            const hostedZones = await route53.listHostedZonesByName().promise();        
            const values = await form.validateFields();
    
            const YOUR_HOSTED_ZONE_ID = hostedZones.HostedZones.find(zone => zone.Name === values.recordName)?.Id;
    
            if (!record || !YOUR_HOSTED_ZONE_ID) {
                throw new Error('HostedZoneId is missing or undefined.');
            }
    
            const params = {
                HostedZoneId: YOUR_HOSTED_ZONE_ID,
                ChangeBatch: {
                    Changes: [
                        {
                            Action: 'UPSERT',
                            ResourceRecordSet: {
                                Name: values.recordName,
                                Type: values.recordType,
                                TTL: values.ttlInSeconds,
                                ResourceRecords: [{ Value: values.valueOrRouteTrafficTo.toString() }],
                            }
                        }
                    ]
                }
            };
    
            await route53.changeResourceRecordSets(params).promise();
            message.success('Record updated successfully. Please Refresh the page!');
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating record:', error);
            message.error('Failed to update record.');
        } finally {
            setLoading(false);
        }
    };
    

    const onChange = (checked: boolean) => {
        console.log(`switch to ${checked}`);
        setIsAliasChecked(checked);
        message.info('Please once ensure the record value!');
    }

    const handleRoutingPolicyChange = (policy: string) => {
        console.log(`Switched to --> `, policy);
        setRecordRoutingPolicy(policy);
    }

    return (
        <div>
            <Modal
                title="EDIT DNS RECORD"
                open={isEditModalOpen}
                onCancel={handleCancel}
                onOk={handleEdit}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                      Return
                    </Button>,
                    <StyledButton key="submit" type="link" loading={loading} onClick={handleEdit}>
                      Edit
                    </StyledButton>,
                  ]}
            >
                <CustomForm form={form} layout="vertical" initialValues={record}>
                    <Form.Item label="Name" name="recordName">
                        <Tooltip title="Edit the subdomain only else can't update">
                            <Input defaultValue={record?.recordName}/>
                        </Tooltip>
                    </Form.Item>

                    <Form.Item label="Record Type" name="recordType" >
                        <Select defaultValue={record?.recordType}>
                            <Option value="PTR">PTR</Option>
                            <Option value="SPF">SPF</Option>
                            <Option value="TXT">TXT</Option>
                            <Option value="MX">MX</Option>
                            <Option value="SRV">SRV</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="alias" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ marginRight: '10px' }}>Alias</span>
                        {
                            record?.alias === 'No' ? <Switch onChange={onChange} disabled /> : <Switch defaultChecked onChange={onChange} disabled />
                        }
                    </Form.Item>

                    <Form.Item label="Value/Route Traffic To" name="valueOrRouteTrafficTo" >
                        <Input defaultValue={record?.valueOrRouteTrafficTo}/>
                    </Form.Item>

                    <Form.Item label="TTL (in seconds)" name="ttlInSeconds">
                        <Input type="number" defaultValue={record?.ttlInSeconds}/>
                    </Form.Item>

                    <Form.Item label="Routing Policy" name="routingPolicy" >
                        <Select defaultValue={record?.routingPolicy} onChange={handleRoutingPolicyChange} disabled>
                            <Option value="simple-routing">Simple routing</Option>
                            <Option value="weighted">Weighted</Option>
                            <Option value="geolocation">Geolocation</Option>
                            <Option value="latency">latency</Option>
                            <Option value="failover">Failover</Option>
                            <Option value="multivalue-answer">Multivalue answer</Option>
                            <Option value="ip-based">IP based</Option>
                            <Option value="geoproximity">Geoproximity</Option>
                        </Select>
                    </Form.Item>
                    {/* {
                        record?.differentiator ? 
                            <Form.Item label="Differentiator">
                                <Input defaultValue={record.differentiator}/>
                            </Form.Item>    
                        :
                            <></>
                    }
                    {
                        record?.healthCheckId !== '-' ? 
                            <Form.Item label="Health Check ID">
                                <Input defaultValue={0?.healthCheckId}/>
                            </Form.Item> 
                        : 
                            <></>
                    }
                    {
                        record?.evaluateTargetHealth !== '-' ? 
                            <Form.Item label="Evaluate Target Health">
                                <Input defaultValue={record?.evaluateTargetHealth} />
                            </Form.Item>
                        :
                            <></>
                    }
                    {
                        record?.recordId !== '-' ? 
                            <Form.Item label="Record ID">
                                <Input defaultValue={record?.recordId} />
                            </Form.Item>
                        :
                            <></>
                    }
                    {
                        recordRoutingPolicy === 'weighted' ? 
                            <Form.Item label="Weight">
                                <Input />
                            </Form.Item>
                        : 
                        recordRoutingPolicy === 'geolocation' ? 
                            <>
                                <Form.Item label="Location"><Input/></Form.Item> 
                            </>
                        : 
                        recordRoutingPolicy === 'latency' ? 
                            <>
                                <Form.Item label="Region"><Input/></Form.Item> 
                            </>
                        :
                        recordRoutingPolicy === 'failover' ? 
                            <>
                                <Form.Item label="Failover Record Type"><Input/></Form.Item> 
                            </>
                        :
                        recordRoutingPolicy === 'multivalue-answer' ? 
                            <>
                                <Form.Item label="Health Check (optional)"><Input/></Form.Item> 
                                <Form.Item label="Record ID"><Input/></Form.Item> 
                            </>
                        :
                        recordRoutingPolicy === 'ip-based' ? 
                            <>
                                <Form.Item label="IP-based"><Input/></Form.Item> 
                            </>
                        :
                        recordRoutingPolicy === 'geoproximity' ? 
                            <>
                                <Form.Item label="Endpoint Locatiion Type"><Input/></Form.Item> 
                                <Form.Item label="Bias"><Input/></Form.Item>
                            </>
                        : 
                            <></>
                    } */}
                </CustomForm>
            </Modal>
        </div>
    )
}

export default EditRecord;

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