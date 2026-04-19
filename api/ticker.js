// api/ticker.js
import axios from 'axios';

const BINANCE_API = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES = 'https://fapi.binance.com/fapi/v1';

export default async (req, res) => {
  const { symbol, type } = req.query;
  // type: 'spot' 或 'futures'

  if (!symbol) {
    return res.status(400).json({ error: '缺少 symbol 参数' });
  }

  try {
    let url;
    
    if (type === 'futures') {
      url = `${BINANCE_FUTURES}/ticker/24hr?symbol=${symbol}USDT`;
    } else {
      url = `${BINANCE_API}/ticker/24hr?symbol=${symbol}USDT`;
    }

    const response = await axios.get(url, {
      timeout: 5000
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      symbol
    });
  }
};
