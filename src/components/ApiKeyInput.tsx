import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  hasApiKey: boolean;
}

export function ApiKeyInput({ onApiKeySet, hasApiKey }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }
    onApiKeySet(apiKey.trim());
    toast.success('API key saved successfully!');
  };

  if (hasApiKey) {
    return (
      <Card className="p-4 bg-surface border-border/50 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-success" />
            <span className="text-sm text-success font-medium">API Key Configured</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApiKeySet('')}
            className="text-xs"
          >
            Change Key
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-surface border-border/50 shadow-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <Label htmlFor="apiKey" className="text-lg font-semibold text-foreground">
              Kimera API Key Required
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your Kimera API key to start transforming images. 
            Get your key from{' '}
            <a 
              href="https://kimera.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              kimera.ai
            </a>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-sm font-medium text-foreground">
            API Key
          </Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Kimera API key..."
              className="pr-10 bg-surface-elevated border-border/50"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          disabled={!apiKey.trim()}
        >
          Save API Key
        </Button>
      </form>
    </Card>
  );
}