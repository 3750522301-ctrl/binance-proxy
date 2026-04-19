import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { symbol, type = 'spot' } = req.query;

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'missing symbol' });
    }

    const base =
      type === 'futures'
        ? 'https://fapi.binance.com/fapi/v1'
        : 'https://api.binance.com/api/v3';

    const [tickerRes, bookRes] = await Promise.all([
      axios.get(`${base}/ticker/24hr?symbol=${symbol}`, { timeout: 10000 }),
      axios.get(`${base}/ticker/bookTicker?symbol=${symbol}`, { timeout: 10000 }).catch(() => ({ data: null }))
    ]);

    return res.status(200).json({
      success: true,
      ...tickerRes.data,
      bookTicker: bookRes.data || null
    });
  } catch (e) {
    const status = e?.response?.status || 500;
    return res.status(status).json({
      success: false,
      error: e.message
    });
  }
}
