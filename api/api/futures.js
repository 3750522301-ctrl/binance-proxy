// api/futures.js
import axios from 'axios';

const BINANCE_FUTURES = 'https://fapi.binance.com/fapi/v1';

export default async (req, res) => {
  const { symbol, endpoint } = req.query;
  // endpoint: 'openInterest', 'fundingRate', 'longShortRatio'

  if (!symbol || !endpoint) {
    return res.status(400).json({ error: '缺少参数' });
  }

  try {
    let url;

    switch (endpoint) {
      case 'openInterest':
        url = `${BINANCE_FUTURES}/openInterest?symbol=${symbol}USDT`;
        break;
      case 'fundingRate':
        url = `${BINANCE_FUTURES}/fundingRate?symbol=${symbol}USDT&limit=1`;
        break;
      case 'longShortRatio':
        url = `${BINANCE_FUTURES}/globalLongShortAccountRatio?symbol=${symbol}USDT&period=5m`;
        break;
      default:
        return res.status(400).json({ error: '未知的 endpoint' });
    }

    const response = await axios.get(url, {
      timeout: 5000
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
