'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Download, Copy, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Suspense } from 'react';

import { createClient } from '@/utils/supabase/client';
import { MouseEvent } from 'react';
import { useUserInfo } from '@/hooks/useUserInfo';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { getCustomerId } from '@/utils/paddle/get-customer-id';

interface LocalSettings {
  walletPublicKey: string;
  sniperooApiKey: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('wallets');
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  // Local settings state
  const [walletPublicKey, setWalletPublicKey] = useState('');
  const [sniperooApiKey, setSniperooApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('localSettings');
    if (savedSettings) {
      try {
        const settings: LocalSettings = JSON.parse(savedSettings);
        setWalletPublicKey(settings.walletPublicKey || '');
        setSniperooApiKey(settings.sniperooApiKey || '');
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const settings: LocalSettings = {
        walletPublicKey,
        sniperooApiKey,
      };

      // Save settings to localStorage
      localStorage.setItem('localSettings', JSON.stringify(settings));

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Settings saved successfully:', settings);
      // Could add a success toast notification here
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Could add an error toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Settings'} />
      <Suspense fallback={<LoadingScreen />}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md grid grid-cols-2 h-12 bg-leaf-highlight/50">
            <TabsTrigger
              value="wallets"
              className="text-sm data-[state=active]:bg-leaf-primary data-[state=active]:text-white mt-0"
            >
              Wallet Settings
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="text-sm data-[state=active]:bg-leaf-primary data-[state=active]:text-white"
            >
              Account Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="space-y-6">
            <div className="grid gap-6">
              {/* Wallet Configuration Card */}
              <Card className="bg-leaf-card border-leaf-border shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Wallet Configuration</CardTitle>
                  <CardDescription>Configure your wallet settings for trading operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="walletPublicKey" className="text-sm text-gray-400">
                        Wallet Public Key
                      </label>
                      <Input
                        id="walletPublicKey"
                        type="text"
                        placeholder="Enter your wallet public key..."
                        value={walletPublicKey}
                        onChange={(e) => setWalletPublicKey(e.target.value)}
                        className="bg-leaf-highlight border-leaf-border text-white font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">Your wallet public key used for trading operations</p>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label htmlFor="sniperooApiKey" className="text-sm text-gray-400">
                        Sniperoo API Key
                      </label>
                      <Input
                        id="sniperooApiKey"
                        type="password"
                        placeholder="Enter your Sniperoo API key..."
                        value={sniperooApiKey}
                        onChange={(e) => setSniperooApiKey(e.target.value)}
                        className="bg-leaf-highlight border-leaf-border text-white font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">API key for accessing Sniperoo trading services</p>
                    </div>

                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="bg-leaf-primary hover:bg-leaf-primary/90 text-white"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="bg-leaf-card border-leaf-border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-white">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="username" className="text-sm text-gray-400">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={user?.user_metadata?.full_name}
                      readOnly
                      className="bg-leaf-highlight/30 border-leaf-border text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm text-gray-400">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      readOnly
                      defaultValue={`${user?.email || 'user'}`}
                      className="bg-leaf-highlight border-leaf-border text-white"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Suspense>
    </main>
  );
}
