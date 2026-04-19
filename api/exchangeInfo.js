import axios from 'axios';

const SPOT_API = 'https://api.binance.com/api/v3/exchangeInfo';
const FUTURES_API = 'https://fapi.binance.com/fapi/v1/exchangeInfo';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const [spotRes, futuresRes] = await Promise.all([
      axios.get(SPOT_API, { timeout: 10000 }),
      axios.get(FUTURES_API, { timeout: 10000 })
    ]);

    const map = {};

    // 现货
    for (const s of spotRes.data.symbols || []) {
      if (s.status === 'TRADING' && s.quoteAsset === 'USDT' && !s.symbol.includes('_')) {
        const asset = s.baseAsset;
        if (!map[asset]) {
          map[asset] = {
            asset,
            spotSymbol: null,
            futuresSymbol: null,
            preferredType: 'spot'
          };
        }
        map[asset].spotSymbol = s.symbol;
      }
    }

    // 合约
    for (const s of futuresRes.data.symbols || []) {
      if (s.status === 'TRADING' && s.quoteAsset === 'USDT') {
        const asset = s.baseAsset;
        if (!map[asset]) {
          map[asset] = {
            asset,
            spotSymbol: null,
            futuresSymbol: null,
            preferredType: 'futures'
          };
        }
        map[asset].futuresSymbol = s.symbol;
      }
    }

    // 你的需求：有合约就优先合约；没有合约才用现货
    const result = Object.values(map)
      .map(item => ({
        ...item,
        preferredType: item.futuresSymbol ? 'futures' : 'spot'
      }))
      .filter(item => item.spotSymbol || item.futuresSymbol)
      .sort((a, b) => a.asset.localeCompare(b.asset));

    return res.status(200).json({
      success: true,
      total: result.length,
      symbols: result
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message
    });
  }
}
