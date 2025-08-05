'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Target, TrendingUp, TrendingDown, Copy, ExternalLink } from 'lucide-react';
import type { ProcessedTokenData } from '@/lib/event-streamer';

interface SnipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: ProcessedTokenData | null;
  // onExecuteTrade now expects the same parameters as the unified function in SniperTable
  onExecuteTrade: (params: {
    token: ProcessedTokenData;
    tradeAmountSol: number;
    takeProfitPercentage: number;
    stopLossPercentage: number;
  }) => Promise<void>; // Expect a Promise<void> as it's an async operation
}

export function SnipeDialog({ open, onOpenChange, token, onExecuteTrade }: SnipeDialogProps) {
  const [tradeAmountSol, setTradeAmountSol] = useState('0.1');
  const [takeProfitPercentage, setTakeProfitPercentage] = useState('50');
  const [stopLossPercentage, setStopLossPercentage] = useState('20');
  const [isExecuting, setIsExecuting] = useState(false);

  if (!token) return null;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExecute = async () => {
    const tradeAmountNum = Number.parseFloat(tradeAmountSol);
    const takeProfitNum = Number.parseFloat(takeProfitPercentage);
    const stopLossNum = Number.parseFloat(stopLossPercentage);

    // Validation for trade amount
    if (isNaN(tradeAmountNum) || tradeAmountNum <= 0) {
      alert('Please enter a valid trade amount in SOL.');
      return;
    }

    // Validation for TP/SL
    if (isNaN(takeProfitNum) || takeProfitNum <= 0 || takeProfitNum > 1000) {
      alert('Please enter a valid take profit percentage (1-1000%)');
      return;
    }

    if (isNaN(stopLossNum) || stopLossNum <= 0 || stopLossNum > 100) {
      alert('Please enter a valid stop loss percentage (1-100%)');
      return;
    }

    setIsExecuting(true);

    try {
      // Call the onExecuteTrade prop, which is the unified function from SniperTable
      await onExecuteTrade({
        token,
        tradeAmountSol: tradeAmountNum,
        takeProfitPercentage: takeProfitNum,
        stopLossPercentage: stopLossNum,
      });
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      // Error handling is now primarily done in SniperTable's handleExecuteTrade
      // This catch block is mostly for local validation errors or unexpected issues
      console.error('Local trade execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClose = () => {
    if (!isExecuting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-leaf-card border-leaf-border text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-leaf-primary" />
            Snipe Token
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your trade parameters for ${token.ticker}
          </DialogDescription>
        </DialogHeader>

        {/* Token Information */}
        <div className="bg-leaf-highlight/20 border border-leaf-border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-leaf-highlight flex items-center justify-center">
                <span className="text-sm font-bold text-white">{token.ticker.substring(0, 2)}</span>
              </div>
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  ${token.ticker}
                  {token.isFirstCall && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs px-2 py-0">NEW</Badge>
                  )}
                </div>
                <div className="text-xs text-gray-400">Solana Token</div>
              </div>
            </div>
            <Badge variant="outline" className={`text-xs font-mono ${getScoreColor(token.score)}`}>
              Score: {token.score}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Mint:</span>
              <code className="text-xs font-mono text-gray-300 bg-leaf-highlight/30 px-2 py-1 rounded">
                {token.mint.substring(0, 8)}...{token.mint.substring(token.mint.length - 4)}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 ml-1 text-gray-500 hover:text-white"
                onClick={() => copyToClipboard(token.mint)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 ml-1 text-gray-500 hover:text-white"
                onClick={() => window.open(`https://solscan.io/token/${token.mint}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Trade Parameters */}
        <div className="space-y-4">
          {/* New: Trade Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="tradeAmount" className="text-sm text-white flex items-center gap-2">
              <img src="/placeholder.svg?height=16&width=16" alt="SOL" className="h-4 w-4" />
              Trade Amount (SOL)
            </Label>
            <Input
              id="tradeAmount"
              type="number"
              placeholder="0.1"
              value={tradeAmountSol}
              onChange={(e) => setTradeAmountSol(e.target.value)}
              className="bg-leaf-highlight border-leaf-border text-white"
              min="0.001"
              step="0.01"
              disabled={isExecuting}
            />
            <p className="text-xs text-gray-500">The amount of SOL to use for this trade.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="takeProfit" className="text-sm text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Take Profit %
              </Label>
              <Input
                id="takeProfit"
                type="number"
                placeholder="50"
                value={takeProfitPercentage}
                onChange={(e) => setTakeProfitPercentage(e.target.value)}
                className="bg-leaf-highlight border-leaf-border text-white"
                min="1"
                max="1000"
                step="1"
                disabled={isExecuting}
              />
              <p className="text-xs text-gray-500">Exit when profit reaches this %</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stopLoss" className="text-sm text-white flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Stop Loss %
              </Label>
              <Input
                id="stopLoss"
                type="number"
                placeholder="20"
                value={stopLossPercentage}
                onChange={(e) => setStopLossPercentage(e.target.value)}
                className="bg-leaf-highlight border-leaf-border text-white"
                min="1"
                max="100"
                step="1"
                disabled={isExecuting}
              />
              <p className="text-xs text-gray-500">Exit when loss reaches this %</p>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="h-4 w-4 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5"></div>
              <div>
                <p className="text-xs text-yellow-500 font-medium">Risk Warning</p>
                <p className="text-xs text-gray-400 mt-1">
                  Trading cryptocurrencies involves substantial risk. Only trade with funds you can afford to lose. Past
                  performance does not guarantee future results.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExecuting}
            className="border-leaf-border text-white hover:bg-leaf-highlight/50 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="bg-leaf-primary hover:bg-leaf-primary/90 text-white"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Executing Trade...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Execute Trade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
