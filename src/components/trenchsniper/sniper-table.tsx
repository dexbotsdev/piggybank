'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Target, TrendingUp, Copy, Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEventStreamer } from '@/hooks/use-event-streamer';
import { SnipeDialog } from './snipe-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { ProcessedTokenData } from '@/lib/event-streamer';
import axios from 'axios'; // Import axios

// Define a type for token snipe status
type TokenSnipeStatus = Map<string, { status: 'success' | 'failure' | 'pending' }>;

export function SniperTable() {
  const {
    tokens,
    connection,
    connect,
    disconnect,
    clearTokens,
    removeToken,
    isConnected,
    isConnecting,
    error,
    lastUpdate,
  } = useEventStreamer();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [snipeDialogOpen, setSnipeDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<ProcessedTokenData | null>(null);

  // Auto Trade states
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false);
  const [isAutoTradeActive, setIsAutoTradeActive] = useState(false);
  const [autoTradeAmountSol, setAutoTradeAmountSol] = useState('0.1');
  const [autoTradeTP, setAutoTradeTP] = useState('50');
  const [autoTradeSL, setAutoTradeSL] = useState('20');

  // API Keys from localStorage
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  const [sniperooApiKey, setSniperooApiKey] = useState<string | null>(null);

  // State to track snipe status for each token (for highlighting)
  const [tokenSnipeStatus, setTokenSnipeStatus] = useState<TokenSnipeStatus>(new Map());
  // State to track tokens that have been auto-sniped to prevent duplicates
  const [autoSnipedTokens, setAutoSnipedTokens] = useState<Set<string>>(new Set());

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('localSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setWalletPublicKey(settings.walletPublicKey || null);
        setSniperooApiKey(settings.sniperooApiKey || null);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Memoized function for executing trades (manual and auto)
  const handleExecuteTrade = useCallback(
    async (params: {
      token: ProcessedTokenData;
      tradeAmountSol: number;
      takeProfitPercentage: number;
      stopLossPercentage: number;
      isAutoTrade?: boolean; // Flag to indicate if it's an auto-trade
    }) => {
      const { token, tradeAmountSol, takeProfitPercentage, stopLossPercentage, isAutoTrade } = params;

      // Set status to pending for the token
      setTokenSnipeStatus((prev) => new Map(prev).set(token.mint, { status: 'pending' }));

      try {
        if (!walletPublicKey || !sniperooApiKey) {
          throw new Error('Wallet Public Key or Sniperoo API Key not configured in settings.');
        }

        const requestBody = {
          walletAddresses: [walletPublicKey],
          tokenAddress: token.mint,
          inputAmount: tradeAmountSol,
          autoSell: {
            enabled: true, // Assuming auto-sell is always enabled for snipe
            strategy: {
              strategyName: 'simple',
              profitPercentage: takeProfitPercentage,
              stopLossPercentage: stopLossPercentage,
            },
          },
        };

        console.log(`[Sniperoo] Sending buy request:`, JSON.stringify(requestBody, null, 2));

        const response = await axios.post('https://api.sniperoo.app/trading/buy-token?toastFrontendId=0', requestBody, {
          headers: {
            Authorization: `Bearer ${sniperooApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`[Sniperoo] Buy response:`, response.data);

        // Assuming the API returns a 'success' field or similar to indicate success
        if (response.data && response.data.success) {
          setTokenSnipeStatus((prev) => new Map(prev).set(token.mint, { status: 'success' }));
          console.log('✅ Trade executed successfully!');
          if (!isAutoTrade) {
            // Only show alert for manual trades
            alert(
              `Trade executed for ${token.ticker}!\nAmount: ${tradeAmountSol} SOL\nTake Profit: ${takeProfitPercentage}%\nStop Loss: ${stopLossPercentage}%`,
            );
          }
        } else {
          throw new Error(response.data.message || 'API call failed with no success indication.');
        }
      } catch (err) {
        console.error('Trade execution failed:', err);
        setTokenSnipeStatus((prev) => new Map(prev).set(token.mint, { status: 'failure' }));
        if (!isAutoTrade) {
          // Only show alert for manual trades
          alert(`Trade execution failed for ${token.ticker}. Please check console for details.`);
        }
      }
    },
    [walletPublicKey, sniperooApiKey],
  ); // Dependencies for useCallback

  // Auto-trade logic: Watch for new tokens and trigger snipe
  useEffect(() => {
    if (isAutoTradeActive && walletPublicKey && sniperooApiKey) {
      tokens.forEach((token) => {
        // Only attempt to snipe if it's a new token (first call) and hasn't been auto-sniped yet
        if (token.isFirstCall && !autoSnipedTokens.has(token.mint)) {
          console.log(`[Auto Trade] New token detected: ${token.ticker}. Attempting to snipe...`);
          handleExecuteTrade({
            token,
            tradeAmountSol: Number.parseFloat(autoTradeAmountSol),
            takeProfitPercentage: Number.parseFloat(autoTradeTP),
            stopLossPercentage: Number.parseFloat(autoTradeSL),
            isAutoTrade: true, // Mark as auto-trade
          });
          setAutoSnipedTokens((prev) => new Set(prev).add(token.mint)); // Add to auto-sniped set
        }
      });
    }
  }, [
    tokens,
    isAutoTradeActive,
    autoTradeAmountSol,
    autoTradeTP,
    autoTradeSL,
    walletPublicKey,
    sniperooApiKey,
    handleExecuteTrade,
    autoSnipedTokens,
  ]);

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.mint.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tokens, searchQuery]);

  // Sort tokens
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return Number.parseInt(b.score) - Number.parseInt(a.score);
        case 'mcap':
          return b.mcap - a.mcap;
        case 'callCount':
          return b.callCount - a.callCount;
        case 'lastCall':
          return b.lastCallTime - a.lastCallTime;
        default:
          return 0;
      }
    });
  }, [filteredTokens, sortBy]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const getScoreColor = (score: string) => {
    const numScore = Number.parseInt(score);
    if (numScore >= 80) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (numScore >= 60) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (numScore >= 40) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  };

  const getCallsBadgeColor = (calls: number) => {
    if (calls >= 10) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (calls >= 5) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    if (calls >= 3) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (calls >= 1) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const handleSnipeClick = (token: ProcessedTokenData) => {
    setSelectedToken(token);
    setSnipeDialogOpen(true);
  };

  const handleToggleStream = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const getConnectionStatusIcon = () => {
    if (isConnecting) {
      return <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white" />;
    }
    if (isConnected) {
      return <Wifi className="h-3.5 w-3.5" />;
    }
    return <WifiOff className="h-3.5 w-3.5" />;
  };

  const getConnectionStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    if (error) return 'Connection Error';
    return 'Disconnected';
  };

  const handleStartStopAutoTrade = () => {
    if (isAutoTradeActive) {
      // Stop auto trade
      setIsAutoTradeActive(false);
      console.log('🛑 Auto trade stopped.');
    } else {
      // Start auto trade
      // Add validation for inputs before starting
      const amount = Number.parseFloat(autoTradeAmountSol);
      const tp = Number.parseFloat(autoTradeTP);
      const sl = Number.parseFloat(autoTradeSL);

      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount in SOL.');
        return;
      }
      if (isNaN(tp) || tp <= 0 || tp > 1000) {
        alert('Please enter a valid Take Profit percentage (1-1000%).');
        return;
      }
      if (isNaN(sl) || sl <= 0 || sl > 100) {
        alert('Please enter a valid Stop Loss percentage (1-100%).');
        return;
      }

      if (!walletPublicKey || !sniperooApiKey) {
        alert('Please configure your Wallet Public Key and Sniperoo API Key in Settings before starting auto-trade.');
        return;
      }

      setIsAutoTradeActive(true);
      setAutoSnipedTokens(new Set()); // Clear previously auto-sniped tokens on start
      console.log('🚀 Auto trade started with:', {
        amount: `${amount} SOL`,
        takeProfit: `${tp}%`,
        stopLoss: `${sl}%`,
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Connection Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-500">Connection Error: {error}</span>
          <Button onClick={connect} size="sm" className="ml-auto bg-red-500 hover:bg-red-600 text-white h-7 text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Sniper</h2>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-xs text-gray-400">{getConnectionStatusText()}</span>
            {lastUpdate && (
              <span className="text-xs text-gray-500">• Last update: {new Date(lastUpdate).toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleToggleStream}
            disabled={isConnecting}
            className={`${
              isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white h-8 text-xs disabled:opacity-50`}
          >
            {getConnectionStatusIcon()}
            <span className="ml-1">{isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}</span>
          </Button>

          {tokens.length > 0 && (
            <Button
              onClick={clearTokens}
              variant="outline"
              className="border-leaf-border text-gray-300 h-8 text-xs bg-transparent"
            >
              Clear ({tokens.length})
            </Button>
          )}

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <Input
              placeholder="Search tokens..."
              className="pl-9 bg-leaf-card border-leaf-border text-gray-300 w-full sm:w-60 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            className="border-leaf-border text-gray-300 flex items-center gap-2 h-8 bg-leaf-card text-xs shadow-md w-full sm:w-auto"
            onClick={() => {
              const sortOptions = ['score', 'mcap', 'callCount', 'lastCall'];
              const currentIndex = sortOptions.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setSortBy(sortOptions[nextIndex]);
            }}
          >
            <span>Sort: {sortBy === 'callCount' ? 'calls' : sortBy === 'lastCall' ? 'recent' : sortBy}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Auto Trade Controls */}
      <div className="flex items-center gap-4 mb-6 bg-leaf-card border border-leaf-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Switch
            id="auto-trade-toggle"
            checked={autoTradeEnabled}
            onCheckedChange={setAutoTradeEnabled}
            className="data-[state=checked]:bg-leaf-primary"
          />
          <Label htmlFor="auto-trade-toggle" className="text-sm text-white">
            Auto Trade
          </Label>
        </div>

        {autoTradeEnabled && (
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="Amount (SOL)"
              type="number"
              value={autoTradeAmountSol}
              onChange={(e) => setAutoTradeAmountSol(e.target.value)}
              className="w-28 h-8 text-xs bg-leaf-highlight border-leaf-border text-white"
              disabled={isAutoTradeActive}
            />
            <Input
              placeholder="TP (%)"
              type="number"
              value={autoTradeTP}
              onChange={(e) => setAutoTradeTP(e.target.value)}
              className="w-20 h-8 text-xs bg-leaf-highlight border-leaf-border text-white"
              min="1"
              max="1000"
              step="1"
              disabled={isAutoTradeActive}
            />
            <Input
              placeholder="SL (%)"
              type="number"
              value={autoTradeSL}
              onChange={(e) => setAutoTradeSL(e.target.value)}
              className="w-20 h-8 text-xs bg-leaf-highlight border-leaf-border text-white"
              min="1"
              max="100"
              step="1"
              disabled={isAutoTradeActive}
            />
            <Button
              onClick={handleStartStopAutoTrade}
              className={`${isAutoTradeActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white h-8 text-xs`}
              disabled={isConnecting || !autoTradeAmountSol || !autoTradeTP || !autoTradeSL}
            >
              {isAutoTradeActive ? 'Stop' : 'Start'}
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-leaf-card border border-leaf-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Active Tokens</p>
              <p className="text-lg font-semibold text-white">{tokens.length}</p>
            </div>
            <Target className="h-5 w-5 text-leaf-primary" />
          </div>
        </div>

        <div className="bg-leaf-card border border-leaf-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">High Score Tokens</p>
              <p className="text-lg font-semibold text-white">
                {tokens.filter((t) => Number.parseInt(t.score) >= 80).length}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
        </div>

        <div className="bg-leaf-card border border-leaf-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Calls</p>
              <p className="text-lg font-semibold text-white">{tokens.reduce((sum, t) => sum + t.callCount, 0)}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-leaf-card border border-leaf-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Connection</p>
              <p className="text-lg font-semibold text-white">{isConnected ? 'Live' : 'Offline'}</p>
            </div>
            <div className={`h-5 w-5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
          </div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="bg-leaf-card border border-leaf-border rounded-lg overflow-hidden shadow-md">
        <div className="flex items-center justify-between p-4 border-b border-leaf-border">
          <h3 className="font-medium text-sm text-white">Live Token Feed</h3>
          <span className="text-gray-400 text-xs">
            Showing {sortedTokens.length} token{sortedTokens.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-leaf-border bg-leaf-highlight/30">
                <th className="h-10 px-4 text-left align-middle font-medium text-gray-400">Token</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-gray-400">Market Cap</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-gray-400">Score</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-gray-400">Total Calls</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-gray-400">Last Call</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-gray-400">Socials</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedTokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center text-gray-500">
                    {searchQuery ? (
                      'No tokens found matching your search.'
                    ) : !isConnected ? (
                      <div className="flex flex-col items-center gap-2">
                        <WifiOff className="h-8 w-8 text-gray-500" />
                        <span>Connect to stream to see live token data</span>
                        <Button onClick={connect} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          Connect to Stream
                        </Button>
                      </div>
                    ) : (
                      'Waiting for token data...'
                    )}
                  </td>
                </tr>
              ) : (
                sortedTokens.map((token) => {
                  const snipeStatus = tokenSnipeStatus.get(token.mint)?.status;
                  const isSnipeButtonDisabled =
                    isAutoTradeActive || snipeStatus === 'pending' || snipeStatus === 'success';

                  return (
                    <tr
                      key={token.mint}
                      className={cn(
                        'border-b border-leaf-border hover:bg-leaf-highlight/10 transition-colors',
                        snipeStatus === 'success' && 'bg-green-500/20',
                        snipeStatus === 'failure' && 'bg-red-500/20',
                        snipeStatus === 'pending' && 'bg-yellow-500/20 animate-pulse',
                      )}
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-leaf-highlight mr-3 flex items-center justify-center relative">
                            <span className="text-xs font-bold text-white">{token.ticker.substring(0, 2)}</span>
                            {token.isFirstCall && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-[8px] text-white font-bold">N</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-white flex items-center gap-2">
                              ${token.ticker}
                              {token.isFirstCall && (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] px-1 py-0">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            {/* Moved Mint Address below Token Ticker */}
                            <div className="flex items-center mt-0.5">
                              <span className="font-mono text-xs text-gray-400 truncate max-w-[120px]">
                                {token.mint.substring(0, 8)}...{token.mint.substring(token.mint.length - 4)}
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0 ml-1 text-gray-500 hover:text-white"
                                      onClick={() => copyToClipboard(token.mint)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy mint address</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Removed Mint Address column */}
                      <td className="p-4 align-middle">
                        <span className="font-mono text-sm text-white">{formatNumber(token.mcap)}</span>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline" className={`text-xs font-mono ${getScoreColor(token.score)}`}>
                          {token.score}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline" className={`text-xs font-mono ${getCallsBadgeColor(token.callCount)}`}>
                          {token.callCount}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-400">{formatTimeAgo(token.lastCallTime)}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {token.socials ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-gray-400">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">No</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            onClick={() => removeToken(token.mint)}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-red-500"
                          >
                            ×
                          </Button>
                          <Button
                            onClick={() => handleSnipeClick(token)}
                            variant="default"
                            className="bg-leaf-primary hover:bg-leaf-primary/90 text-white h-7 px-3 text-xs"
                            disabled={isSnipeButtonDisabled} // Disabled when auto-trade is active or snipe is pending/success
                          >
                            {snipeStatus === 'pending' ? (
                              <>
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white mr-1"></div>
                                Sniping...
                              </>
                            ) : snipeStatus === 'success' ? (
                              <>
                                <span className="mr-1">✅</span>
                                Sniped!
                              </>
                            ) : snipeStatus === 'failure' ? (
                              <>
                                <span className="mr-1">❌</span>
                                Failed
                              </>
                            ) : (
                              <>
                                <Target className="h-3.5 w-3.5 mr-1" />
                                Snipe
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snipe Dialog */}
      <SnipeDialog
        open={snipeDialogOpen}
        onOpenChange={setSnipeDialogOpen}
        token={selectedToken}
        onExecuteTrade={handleExecuteTrade} // Pass the unified execute trade function
      />
    </div>
  );
}
