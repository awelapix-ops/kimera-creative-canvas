import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ResultDisplayProps {
  status: 'processing' | 'completed' | 'error' | null;
  resultImage: string | null;
  originalImage: File | null;
  onRetry: () => void;
}

export function ResultDisplay({ status, resultImage, originalImage, onRetry }: ResultDisplayProps) {
  const downloadImage = async () => {
    if (!resultImage) return;
    
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-transformed-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  if (!status && !resultImage) {
    return (
      <Card className="p-8 bg-surface border-border/50 shadow-card">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-hero rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-dashed border-primary/50 rounded-full flex items-center justify-center">
              <span className="text-primary/70 font-mono text-xs">AI</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Ready to Transform</h3>
            <p className="text-muted-foreground">
              Upload an image and enter a transformation prompt to get started
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-surface border-border/50 shadow-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Transformation Result</h3>
          {status && (
            <div className="flex items-center gap-2">
              {status === 'processing' && (
                <>
                  <Clock className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm text-primary">Processing...</span>
                </>
              )}
              {status === 'completed' && (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Completed</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">Error</span>
                </>
              )}
            </div>
          )}
        </div>

        {status === 'processing' && (
          <div className="space-y-4">
            <div className="aspect-video bg-surface-elevated rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono text-primary">AI</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Transforming your image...</p>
                  <p className="text-xs text-muted-foreground">This usually takes 30-60 seconds</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'completed' && resultImage && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Your Superhero Transformation</p>
              <div className="aspect-square bg-surface-elevated rounded-lg overflow-hidden shadow-glow">
                <img
                  src={resultImage}
                  alt="Superhero Transformation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={downloadImage}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
              <Button
                variant="outline"
                onClick={onRetry}
                className="bg-surface-elevated border-border/50 hover:bg-primary/10 hover:border-primary/50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="aspect-video bg-surface-elevated rounded-lg border-2 border-dashed border-destructive/30 flex items-center justify-center">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Transformation Failed</p>
                  <p className="text-xs text-muted-foreground">Something went wrong. Please try again.</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full bg-surface-elevated border-border/50 hover:bg-primary/10 hover:border-primary/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}