import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { symbol, interval = '1h', limit = '100', type = 'spot' } = req.query;

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'missing symbol' });
    }

    const base =
      type === 'futures'
        ? 'https://fapi.binance.com/fapi/v1'
        : 'https://api.binance.com/api/v3';

    const response = await axios.get(
      `${base}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { timeout: 10000 }
    );

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (e) {
    const status = e?.response?.status || 500;
    return res.status(status).json({
      success: false,
      error: e.message
    });
  }
}
