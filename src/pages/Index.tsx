import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { TransformationPrompt } from '@/components/TransformationPrompt';
import { ResultDisplay } from '@/components/ResultDisplay';
import { KimeraApiService } from '@/services/kimeraApi';
import { toast } from 'sonner';
import { Sparkles, Zap } from 'lucide-react';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationStatus, setTransformationStatus] = useState<'processing' | 'completed' | 'error' | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    // Reset previous results
    setTransformationStatus(null);
    setResultImage(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setTransformationStatus(null);
    setResultImage(null);
  };

  const handleTransform = async () => {
    if (!selectedImage || !prompt.trim()) {
      toast.error('Please select an image and enter a transformation prompt');
      return;
    }

    setIsTransforming(true);
    setTransformationStatus('processing');
    setResultImage(null);

    try {
      // Start the transformation
      const response = await KimeraApiService.startTransformation(selectedImage, prompt);
      
      toast.success('Transformation started! Processing your image...');

      // Poll for completion
      const finalImageUrl = await KimeraApiService.pollForCompletion(
        response.id,
        (status) => {
          console.log('Status update:', status);
        }
      );

      setResultImage(finalImageUrl);
      setTransformationStatus('completed');
      toast.success('Image transformation completed!');
    } catch (error) {
      console.error('Transformation error:', error);
      setTransformationStatus('error');
      toast.error('Failed to transform image. Please try again.');
    } finally {
      setIsTransforming(false);
    }
  };

  const handleRetry = () => {
    setTransformationStatus(null);
    setResultImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="p-3 bg-gradient-primary rounded-full shadow-glow">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground">
              AI Image
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Transform</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload any image and transform it into anything you can imagine with the power of artificial intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClearImage={handleClearImage}
            />
            
            <TransformationPrompt
              prompt={prompt}
              onPromptChange={setPrompt}
              onTransform={handleTransform}
              isLoading={isTransforming}
              disabled={!selectedImage || isTransforming}
            />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <ResultDisplay
              status={transformationStatus}
              resultImage={resultImage}
              originalImage={selectedImage}
              onRetry={handleRetry}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Powered by Advanced AI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our cutting-edge AI technology can transform your images in ways you never imagined
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Creative Freedom</h3>
            <p className="text-muted-foreground">
              Transform your photos into artwork, fantasy scenes, or any style you can describe
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Get your transformed images in under a minute with our optimized AI pipeline
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
              <div className="w-8 h-8 border-2 border-current rounded border-primary-foreground"></div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">High Quality</h3>
            <p className="text-muted-foreground">
              Professional-grade AI ensures your transformed images look stunning and detailed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;