import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Sparkles } from 'lucide-react';

interface TransformationPromptProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onTransform: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const EXAMPLE_PROMPTS = [
  "a cyberpunk warrior with neon armor",
  "a magical forest fairy with glowing wings",
  "a futuristic robot with chrome plating",
  "a medieval knight in golden armor",
  "a space explorer in an alien landscape",
];

export function TransformationPrompt({ 
  prompt, 
  onPromptChange, 
  onTransform, 
  isLoading, 
  disabled 
}: TransformationPromptProps) {
  return (
    <Card className="p-6 bg-surface border-border/50 shadow-card">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Transformation Prompt</h3>
        </div>
        
        <div className="space-y-3">
          <Textarea
            placeholder="Describe how you want to transform your image... (e.g., 'a futuristic cyborg with glowing eyes')"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="min-h-[100px] bg-surface-elevated border-border/50 text-foreground placeholder:text-muted-foreground resize-none"
            disabled={disabled}
          />
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onPromptChange(example)}
                  disabled={disabled}
                  className="text-xs h-7 bg-surface-elevated border-border/50 hover:bg-primary/10 hover:border-primary/50"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <Button
          onClick={onTransform}
          disabled={disabled || !prompt.trim()}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
              Transforming...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Transform Image
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}