import axios from 'axios';

const BASE = 'https://fapi.binance.com/fapi/v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'missing symbol' });
    }

    const [openInterestRes, fundingRateRes, longShortRes, oiHistRes] = await Promise.all([
      axios.get(`${BASE}/openInterest?symbol=${symbol}`, { timeout: 10000 }),
      axios.get(`${BASE}/fundingRate?symbol=${symbol}&limit=1`, { timeout: 10000 }),
      axios.get(`${BASE}/globalLongShortAccountRatio?symbol=${symbol}&period=5m&limit=1`, { timeout: 10000 }),
      axios.get(`${BASE}/openInterestHist?symbol=${symbol}&period=5m&limit=100`, { timeout: 10000 }).catch(() => ({ data: [] }))
    ]);

    return res.status(200).json({
      success: true,
      openInterest: openInterestRes.data,
      fundingRate: fundingRateRes.data,
      longShortRatio: longShortRes.data,
      openInterestHist: oiHistRes.data || []
    });
  } catch (e) {
    const status = e?.response?.status || 500;
    return res.status(status).json({
      success: false,
      error: e.message
    });
  }
}
