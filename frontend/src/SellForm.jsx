import React, { useState } from 'react';
import axios from 'axios';

export default function SellForm(){
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function update(key, value){
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.keys(form).forEach(k=>{
      if (form[k] !== undefined && form[k] !== null) fd.append(k, form[k]);
    });
    try {
      const res = await axios.post((process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/api/leads', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult({ success: true, data: res.data });
      setForm({});
    } catch (err) {
      setResult({ success: false, error: err?.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Full name (required)<br/>
        <input required value={form.contactName||''} onChange={e=>update('contactName', e.target.value)} />
      </label>
      <br/>
      <label>Phone (required)<br/>
        <input required value={form.contactPhone||''} onChange={e=>update('contactPhone', e.target.value)} />
      </label>
      <br/>
      <label>Email<br/>
        <input value={form.contactEmail||''} onChange={e=>update('contactEmail', e.target.value)} />
      </label>
      <br/>
      <label>Property address (required)<br/>
        <input required value={form.propertyAddress||''} onChange={e=>update('propertyAddress', e.target.value)} />
      </label>
      <br/>
      <label>City<br/>
        <input value={form.city||''} onChange={e=>update('city', e.target.value)} />
      </label>
      <br/>
      <label>ZIP<br/>
        <input value={form.zip||''} onChange={e=>update('zip', e.target.value)} />
      </label>
      <br/>
      <label>Occupancy<br/>
        <select value={form.occupancy||''} onChange={e=>update('occupancy', e.target.value)}>
          <option value="">Select</option>
          <option value="owner-occupied">Owner occupied</option>
          <option value="tenant-occupied">Tenant occupied</option>
          <option value="vacant">Vacant</option>
        </select>
      </label>
      <br/>
      <label>Asking price<br/>
        <input type="number" value={form.askingPrice||''} onChange={e=>update('askingPrice', e.target.value)} />
      </label>
      <br/>
      <label>Estimated repair cost<br/>
        <input type="number" value={form.estimatedRepairCost||''} onChange={e=>update('estimatedRepairCost', e.target.value)} />
      </label>
      <br/>
      <label>Notes<br/>
        <textarea value={form.notes||''} onChange={e=>update('notes', e.target.value)} />
      </label>
      <br/>
      <label><input required type="checkbox" checked={!!form.consent} onChange={e=>update('consent', e.target.checked)} /> I consent to be contacted and agree to the privacy policy.</label>
      <br/>
      <button type="submit" disabled={loading}>{loading? 'Submitting...' : 'Submit'}</button>

      {result && result.success && <div style={{ marginTop: 12, color: 'green' }}>Thanks! Eligibility: {result.data.eligibility.score} ({result.data.eligibility.status})</div>}
      {result && !result.success && <div style={{ marginTop: 12, color: 'red' }}>Error: {result.error}</div>}
    </form>
  );
}
