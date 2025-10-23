const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

async function sendLeadEmail(to, lead) {
  const hostname = process.env.HOSTNAME || 'https://norcalequitypartners.com';
  const html = `
    <h2>New Lead: ${lead.contact.name}</h2>
    <p><strong>Phone:</strong> ${lead.contact.phone}  <strong>Email:</strong> ${lead.contact.email}</p>
    <p><strong>Address:</strong> ${lead.property.address}, ${lead.property.city} ${lead.property.zip}</p>
    <p><strong>Asking Price:</strong> ${lead.property.askingPrice || 'n/a'} &nbsp; <strong>Repairs:</strong> ${lead.property.estimatedRepairCost || 'n/a'}</p>
    <p><strong>Eligibility Score:</strong> ${lead.eligibility?.score || 'n/a'} (${lead.eligibility?.status || 'n/a'})</p>
    <pre>${lead.property.notes || ''}</pre>
    <p><a href="${hostname}/admin/leads/${lead._id}">View in admin (if available)</a></p>
  `;
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || 'leads@norcalequitypartners.com',
    to,
    subject: `New Seller Lead: ${lead.contact.name} — Score ${lead.eligibility?.score || 'n/a'}`,
    html
  });
  return info;
}

module.exports = { sendLeadEmail };
