import { Tooltip } from 'antd';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
 
const RecordChart:React.FC = () => {
    const recordTypeData = [
        { name: 'A', count: 3 },
        { name: 'AAAA', count: 2 },
        { name: 'CNAME', count: 5 },
        { name: 'MX', count: 2 },
        { name: 'NS', count: 3 },
        { name: 'PTR', count: 6 },
        { name: 'SOA', count: 1 },
        { name: 'SRV', count: 9 },
        { name: 'TXT', count: 5 },
        { name: 'DNSSEC', count: 7 },
    ];

    return (
        <RecordChartComponent>
            <RecordChartHeading>
                <h2>RECORD TYPE DISTRIBUTION</h2>
            </RecordChartHeading>
            <RecordBarChart>
                <BarChart width={400} height={300} data={recordTypeData}>
                    <CartesianGrid />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
            </RecordBarChart>            
        </RecordChartComponent>
    );
};
 
export default RecordChart;

const RecordChartComponent = styled.div`
    margin-top: 3%;
    margin-left: 1%;
`;

const RecordChartHeading = styled.div`
    font-size: 80%;
`;

const RecordBarChart = styled.div`
    margin-top: 2%;
`;