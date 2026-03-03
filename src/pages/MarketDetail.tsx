import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, PageTransition, Button } from '../components/ui';

// ==================== Mock Token Data ====================

const mockTokenDetails: Record<string, {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change24hValue: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  icon: string;
  description: string;
}> = {
  cc: {
    symbol: 'CC',
    name: 'Canton Coin',
    price: 1.25,
    change24h: 5.23,
    change24hValue: 0.062,
    volume24h: 125000000,
    marketCap: 2500000000,
    high24h: 1.32,
    low24h: 1.18,
    icon: '◆',
    description: 'Native token of the Canton Network',
  },
  eth: {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3456.78,
    change24h: -2.15,
    change24hValue: -75.89,
    volume24h: 15600000000,
    marketCap: 415000000000,
    high24h: 3520.00,
    low24h: 3380.50,
    icon: '◆',
    description: 'Decentralized smart contract platform',
  },
  btc: {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67890.12,
    change24h: 1.85,
    change24hValue: 1234.56,
    volume24h: 28900000000,
    marketCap: 1335000000000,
    high24h: 68500.00,
    low24h: 66500.00,
    icon: '₿',
    description: 'Digital gold and store of value',
  },
  usdc: {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.00,
    change24h: 0.02,
    change24hValue: 0.0002,
    volume24h: 8900000000,
    marketCap: 42000000000,
    high24h: 1.01,
    low24h: 0.99,
    icon: '$',
    description: 'USD-backed stablecoin',
  },
};

// Generate mock OHLC data
const generateOHLCData = (basePrice: number, timeframe: string): any[] => {
  const data: any[] = [];
  const now = new Date();
  let points = 100;
  let interval = 60 * 60 * 1000;
  
  switch (timeframe) {
    case '1h':
      points = 24;
      interval = 60 * 60 * 1000;
      break;
    case '4h':
      points = 30;
      interval = 4 * 60 * 60 * 1000;
      break;
    case '1d':
      points = 90;
      interval = 24 * 60 * 60 * 1000;
      break;
    case '1w':
      points = 52;
      interval = 7 * 24 * 60 * 60 * 1000;
      break;
  }
  
  let price = basePrice * 0.8;
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval);
    const volatility = basePrice * 0.02;
    const trend = Math.sin(i / 10) * basePrice * 0.1;
    
    const open = price + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility + trend * 0.1;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    data.push({
      time: Math.floor(time.getTime() / 1000),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
    });
    
    price = close;
  }
  
  return data;
};

// ==================== Market 详情页 ====================

export const MarketDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');
  const [isFavorite, setIsFavorite] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);

  const token = useMemo(() => {
    return mockTokenDetails[symbol?.toLowerCase() || ''] || mockTokenDetails.cc;
  }, [symbol]);

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;
    
    const initChart = async () => {
      const LightweightCharts = await import('lightweight-charts');
      const { createChart, ColorType } = LightweightCharts;
      
      const chart = createChart(chartContainerRef.current!, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: 'rgba(59, 130, 246, 0.5)',
            labelBackgroundColor: '#3b82f6',
          },
          horzLine: {
            color: 'rgba(59, 130, 246, 0.5)',
            labelBackgroundColor: '#3b82f6',
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          timeVisible: true,
        },
        autoSize: true,
      });

      const series = (chart as any).addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      chartRef.current = chart;
      seriesRef.current = series;
      setChartLoaded(true);
    };

    initChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !chartLoaded) return;
    
    const data = generateOHLCData(token.price, timeframe);
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [timeframe, token.price, chartLoaded]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(price < 1 ? 4 : 2);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${(volume / 1e3).toFixed(2)}K`;
  };

  const formatMarketCap = (mc: number) => {
    if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
    if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`;
    return `$${(mc / 1e6).toFixed(2)}M`;
  };

  const handleSwap = () => {
    navigate('/swap', { state: { fromToken: token.symbol, toToken: 'USDC' } });
  };

  return (
    <PageTransition className="min-h-screen">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)] px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/market')}
              className="p-2 -ml-2 hover:bg-[var(--card)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl">
                {token.icon}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-white">{token.symbol}</h1>
                  <span className="text-sm text-gray-500">{token.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">${formatPrice(token.price)}</span>
                  <span className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">{t('market.marketCap')}</span>
            </div>
            <p className="text-lg font-semibold text-white">{formatMarketCap(token.marketCap)}</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">{t('market.volume24h')}</span>
            </div>
            <p className="text-lg font-semibold text-white">{formatVolume(token.volume24h)}</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">{t('market.high24h')}</span>
            </div>
            <p className="text-lg font-semibold text-white">${formatPrice(token.high24h)}</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs">{t('market.low24h')}</span>
            </div>
            <p className="text-lg font-semibold text-white">${formatPrice(token.low24h)}</p>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{t('market.chart.title')}</h3>
            
            <div className="flex bg-white/5 rounded-lg p-1">
              {(['1h', '4h', '1d', '1w'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeframe === tf 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {t(`market.chart.timeframe.${tf}`)}
                </button>
              ))}
            </div>
          </div>
          
          <div 
            ref={chartContainerRef} 
            className="h-80 w-full rounded-lg bg-white/[0.02]"
          />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2">About {token.name}</h3>
          <p className="text-gray-400">{token.description}</p>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSwap}
          >
            {t('market.swapCTA', { from: token.symbol })}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default MarketDetailPage;