'use client';

import { useState, useEffect, useCallback } from 'react';
import { eventStreamer, type ProcessedTokenData, type StreamerConnection } from '@/lib/event-streamer';

export function useEventStreamer() {
  const [tokens, setTokens] = useState<ProcessedTokenData[]>([]);
  const [connection, setConnection] = useState<StreamerConnection>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastUpdate: null,
  });

  // Handle new token data with call counting logic
  const handleTokenData = useCallback((newToken: ProcessedTokenData) => {
    setTokens((prevTokens) => {
      // Check if token already exists
      const existingIndex = prevTokens.findIndex((token) => token.mint === newToken.mint);

      if (existingIndex >= 0) {
        // Token exists - update it
        const updatedTokens = [...prevTokens];
        const existingToken = updatedTokens[existingIndex];

        // Update the token with new data
        updatedTokens[existingIndex] = {
          ...newToken,
          // Handle call counting logic:
          // - If isFirstCall is true, this shouldn't happen for existing tokens, but reset to 1
          // - If isFirstCall is false (newCall was 0), increment the call count
          callCount: newToken.isFirstCall ? 1 : existingToken.callCount + 1,
          lastCallTime: Date.now(),
        };

        console.log(`📊 Updated token ${newToken.ticker}:`, {
          mint: newToken.mint,
          isFirstCall: newToken.isFirstCall,
          previousCallCount: existingToken.callCount,
          newCallCount: updatedTokens[existingIndex].callCount,
        });

        return updatedTokens;
      } else {
        // New token - add it to the beginning of the list
        const processedToken: ProcessedTokenData = {
          ...newToken,
          // For new tokens:
          // - If isFirstCall is true (newCall was 1), set callCount to 1
          // - If isFirstCall is false (newCall was 0), this is unusual but set to 1
          callCount: 1,
          lastCallTime: Date.now(),
        };

        console.log(`🆕 New token ${newToken.ticker}:`, {
          mint: newToken.mint,
          isFirstCall: newToken.isFirstCall,
          callCount: processedToken.callCount,
        });

        const newTokens = [processedToken, ...prevTokens];

        // Keep only the most recent 50 tokens to prevent memory issues
        return newTokens.slice(0, 50);
      }
    });
  }, []);

  // Handle connection status changes
  const handleStatusChange = useCallback((status: StreamerConnection) => {
    setConnection(status);
  }, []);

  // Connect to stream
  const connect = useCallback(() => {
    eventStreamer.connect();
  }, []);

  // Disconnect from stream
  const disconnect = useCallback(() => {
    eventStreamer.disconnect();
  }, []);

  // Clear all tokens
  const clearTokens = useCallback(() => {
    setTokens([]);
  }, []);

  // Remove a specific token
  const removeToken = useCallback((mint: string) => {
    setTokens((prevTokens) => prevTokens.filter((token) => token.mint !== mint));
  }, []);

  useEffect(() => {
    // Subscribe to token data and status updates
    const unsubscribeTokenData = eventStreamer.onTokenData(handleTokenData);
    const unsubscribeStatus = eventStreamer.onStatusChange(handleStatusChange);

    // Get initial status
    setConnection(eventStreamer.getStatus());

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeTokenData();
      unsubscribeStatus();
    };
  }, [handleTokenData, handleStatusChange]);

  return {
    tokens,
    connection,
    connect,
    disconnect,
    clearTokens,
    removeToken,
    isConnected: connection.isConnected,
    isConnecting: connection.isConnecting,
    error: connection.error,
    lastUpdate: connection.lastUpdate,
  };
}
