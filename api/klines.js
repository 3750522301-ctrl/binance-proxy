// api/klines.js
import axios from 'axios';

const BINANCE_API = 'https://api.binance.com/api/v3';

export default async (req, res) => {
  const { symbol, interval, limit = 100, type } = req.query;

  if (!symbol || !interval) {
    return res.status(400).json({ error: '缺少参数' });
  }

  try {
    const url = `${BINANCE_API}/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`;

    const response = await axios.get(url, {
      timeout: 5000
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
