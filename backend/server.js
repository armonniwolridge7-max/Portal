require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Lead = require('./models/Lead');
const { computeEligibility } = require('./eligibility');
const { sendLeadEmail } = require('./mailer');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/norcale';
mongoose.connect(MONGODB_URI, {});

app.post('/api/leads', upload.array('photos', 5), async (req, res) => {
  try {
    const data = req.body;
    // basic required fields
    if (!data.contactName || !data.contactPhone || !data.propertyAddress) {
      return res.status(400).json({ error: 'Missing required fields: name, phone, or address' });
    }

    const lead = {
      contact: {
        name: data.contactName,
        phone: data.contactPhone,
        email: data.contactEmail || '',
        preferredContact: data.preferredContact || '',
        bestTime: data.bestTime || ''
      },
      property: {
        address: data.propertyAddress,
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        type: data.propertyType || '',
        condition: data.propertyCondition || '',
        occupancy: data.occupancy || '',
        askingPrice: data.askingPrice ? Number(data.askingPrice) : null,
        mortgageBalance: data.mortgageBalance ? Number(data.mortgageBalance) : null,
        estimatedRepairCost: data.estimatedRepairCost ? Number(data.estimatedRepairCost) : null,
        onMarket: data.onMarket === 'true' || false,
        titleIssues: data.titleIssues === 'true' || false,
        notes: data.notes || ''
      },
      source: 'webform',
      createdAt: new Date(),
      status: 'new'
    };

    // compute eligibility
    const eligibility = computeEligibility(lead);
    lead.eligibility = eligibility;

    const saved = await Lead.create(lead);

    // send email (best-effort)
    try {
      await sendLeadEmail(process.env.TARGET_EMAIL || 'you@norcalequitypartners.com', saved);
    } catch (e) {
      console.error('mail error', e);
    }

    res.json({ success: true, id: saved._id, eligibility: eligibility });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/leads', async (req, res) => {
  // Simple admin list (no auth in this minimal example) - DO NOT use in production without protecting!
  const leads = await Lead.find().sort({ createdAt: -1 }).limit(200);
  res.json(leads);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Backend listening on', port));
