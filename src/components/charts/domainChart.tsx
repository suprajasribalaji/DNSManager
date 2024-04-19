import React from 'react';
import { Tooltip } from 'antd';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';

const DomainChart:React.FC = () => {
    const domainData = [
        { name: 'Domain A', count: 20 },
        { name: 'Domain B', count: 30 },
        { name: 'Domain C', count: 15 },
        { name: 'Domain D', count: 25 },
    ];

    return (
        <DomainChartComponent>
            <DomainChartHeading>
                <h2>DOMAIN DISTRIBUTION</h2>
            </DomainChartHeading>
            <DomainBarChart>
                <BarChart width={400} height={300} data={domainData}>
                    <CartesianGrid />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
            </DomainBarChart>
        </DomainChartComponent>
    );
};
 
export default DomainChart;

const DomainChartComponent = styled.div`
    margin-top: 3%;
    margin-left: 1%;
`;

const DomainChartHeading = styled.div`
    font-size: 80%;
`;

const DomainBarChart = styled.div`
    margin-top: 2%;
`;