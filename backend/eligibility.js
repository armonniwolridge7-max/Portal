function computeEligibility(lead) {
  const breakdown = {};
  let score = 0;

  // timeframe / motivation (simple heuristics)
  const tf = (lead.property.timeframe || '').toString().toLowerCase();
  // If the frontend doesn't submit timeframe, look for a bestTime heuristic (simple default)
  if (tf.includes('asap')) { breakdown.motivated = 25; score += 25; }
  else if (tf.includes('30')) { breakdown.motivated = 15; score += 15; }
  else if (tf.includes('60')) { breakdown.motivated = 8; score += 8; }
  else { breakdown.motivated = 5; score += 5; }

  // occupancy
  const occ = (lead.property.occupancy || '').toString().toLowerCase();
  if (occ === 'vacant') { breakdown.occupancy = 20; score += 20; }
  else if (occ.includes('owner')) { breakdown.occupancy = 10; score += 10; }
  else { breakdown.occupancy = 0; }

  // repairs estimated (if numeric)
  const rep = Number(lead.property.estimatedRepairCost || 0);
  if (rep > 0) {
    if (rep < 10000) { breakdown.repairs = 20; score += 20; }
    else if (rep < 30000) { breakdown.repairs = 10; score += 10; }
    else { breakdown.repairs = 0; }
  } else {
    breakdown.repairs = 5; score += 5;
  }

  // title issues
  if (lead.property.titleIssues) { breakdown.titleIssues = -30; score -= 30; } else { breakdown.titleIssues = 0; }

  // on market
  if (lead.property.onMarket) { breakdown.onMarket = -10; score -= 10; } else { breakdown.onMarket = 0; }

  // mortgage vs asking -> distressed indicator
  const asking = Number(lead.property.askingPrice || 0);
  const mort = Number(lead.property.mortgageBalance || 0);
  const repair = Number(lead.property.estimatedRepairCost || 0);
  if (asking > 0 && mort > 0) {
    if (asking < (mort + repair)) { breakdown.distressed = 15; score += 15; } else { breakdown.distressed = 0; }
  } else {
    breakdown.distressed = 0;
  }

  // geo fit (zipcodes)
  const allowed = (process.env.ALLOWED_ZIPCODES || '').split(',').map(z=>z.trim()).filter(Boolean);
  if (allowed.includes(lead.property.zip)) { breakdown.geoFit = 10; score += 10; } else { breakdown.geoFit = 0; }

  const finalScore = Math.max(0, Math.min(100, score));
  const status = finalScore >= 65 ? 'high' : finalScore >= 40 ? 'medium' : 'low';
  return { score: finalScore, breakdown, status };
}

module.exports = { computeEligibility };
