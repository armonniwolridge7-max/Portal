import React from 'react';
import SellForm from './SellForm';

export default function App(){
  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>NorCal Equity Partners — Sell Your Property</h1>
      <SellForm />
    </div>
  );
}
