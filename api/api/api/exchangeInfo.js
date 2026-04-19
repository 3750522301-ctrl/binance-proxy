// api/exchangeInfo.js
import axios from 'axios';

const BINANCE_API = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES = 'https://fapi.binance.com/fapi/v1';

export default async (req, res) => {
  try {
    const [spotRes, futuresRes] = await Promise.all([
      axios.get(`${BINANCE_API}/exchangeInfo`, { timeout: 10000 }),
      axios.get(`${BINANCE_FUTURES}/exchangeInfo`, { timeout: 10000 })
    ]);

    // 只提取能交易的现货
    const spotSymbols = spotRes.data.symbols
      .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT')
      .map(s => ({
        asset: s.baseAsset,
        symbol: s.symbol,
        type: 'spot'
      }));

    // 只提取能交易的合约
    const futuresSymbols = futuresRes.data.symbols
      .filter(s => s.status === 'TRADING' && s.quoteAsset === 'USDT')
      .map(s => ({
        asset: s.baseAsset,
        symbol: s.symbol,
        type: 'futures'
      }));

    // 合并：现货优先，现货没有的才用合约
    const assetMap = {};

    // 先加现货
    spotSymbols.forEach(s => {
      if (!assetMap[s.asset]) {
        assetMap[s.asset] = { asset: s.asset, spot: s.symbol, futures: null };
      } else {
        assetMap[s.asset].spot = s.symbol;
      }
    });

    // 再加合约（如果现货没有）
    futuresSymbols.forEach(s => {
      if (!assetMap[s.asset]) {
        assetMap[s.asset] = { asset: s.asset, spot: null, futures: s.symbol };
      } else {
        assetMap[s.asset].futures = s.symbol;
      }
    });

    const result = Object.values(assetMap)
      .filter(item => item.spot || item.futures)
      .sort((a, b) => a.asset.localeCompare(b.asset));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      symbols: result,
      total: result.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
