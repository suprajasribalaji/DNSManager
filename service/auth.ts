const express = require('express');
const AWS = require('aws-sdk');

const app = express();
const port = 3001;

AWS.config.update({
  accessKeyId: 'AKIASRL7FVZFLJTGFBYT',
  secretAccessKey: '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',
  region: 'us-east-1'
});

const route53 = new AWS.Route53();

const formatRecord = (domain, type, value) => ({
  Name: domain,
  Type: type,
  ResourceRecords: [{ Value: value }],
  TTL: 300 
});

const YOUR_HOSTED_ZONE_ID = 'Z03475321WH1NH01XRPEQ';

// Create a DNS record
app.post('https://route53.amazonaws.com/2013-04-01/hostedzone/Z03475321WH1NH01XRPEQ/rrset', async (req, res) => {
  const { domain, type, value } = req.body;
  const params = {
    ChangeBatch: {
      Changes: [{
        Action: 'CREATE',
        ResourceRecordSet: formatRecord(domain, type, value)
      }]
    },
    HostedZoneId: YOUR_HOSTED_ZONE_ID 
  };

  try {
    await route53.changeResourceRecordSets(params).promise();
    res.status(201).send('DNS record created successfully');
  } catch (error) {
    console.error('Error creating DNS record:', error);
    res.status(500).send('Internal server error');
  }
});

// Get a DNS record
app.get('/api/add-dns-record', async (req, res) => {
  const { domain, type } = req.params;
  const params = {
    HostedZoneId: YOUR_HOSTED_ZONE_ID,
    StartRecordName: domain,
    StartRecordType: type
  };

  try {
    const response = await route53.listResourceRecordSets(params).promise();
    const record = response.ResourceRecordSets;
    if (record) {
      res.status(200).json(record);
    } else {
      res.status(404).send('DNS record not found');
    }
  } catch (error) {
    console.error('Error getting DNS record:', error);
    res.status(500).send('Internal server error');
  }
});

// Delete a DNS record
app.delete('/dns/:recordId', async (req, res) => {
    const { recordId } = req.params;
    const params = {
      ChangeBatch: {
        Changes: [{
          Action: 'DELETE',
          ResourceRecordSet: {
            Name: recordId, // Assuming recordId is the name of the record
            Type: 'A', // Assuming the record type is A, change it if needed
            ResourceRecords: [] // No need to provide records for DELETE action
          }
        }]
      },
      HostedZoneId: YOUR_HOSTED_ZONE_ID 
    };
  
    try {
      await route53.changeResourceRecordSets(params).promise();
      res.status(204).send(); // No content since the record is deleted
    } catch (error) {
      console.error('Error deleting DNS record:', error);
      res.status(500).send('Internal server error');
    }
  });
  
  // Edit a DNS record
  app.put('/dns/:recordId', async (req, res) => {
    const { recordId } = req.params;
    const { domain, type, value } = req.body;
    const params = {
      ChangeBatch: {
        Changes: [{
          Action: 'UPSERT', // Use UPSERT to either create or update the record
          ResourceRecordSet: formatRecord(domain, type, value)
        }]
      },
      HostedZoneId: YOUR_HOSTED_ZONE_ID 
    };
  
    try {
      await route53.changeResourceRecordSets(params).promise();
      res.status(200).send('DNS record updated successfully');
    } catch (error) {
      console.error('Error updating DNS record:', error);
      res.status(500).send('Internal server error');
    }
  });


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
