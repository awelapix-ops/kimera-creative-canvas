import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { TransformationPrompt } from '@/components/TransformationPrompt';
import { ResultDisplay } from '@/components/ResultDisplay';
import { KimeraApiService } from '@/services/kimeraApi';
import { toast } from 'sonner';
import { Sparkles, Zap, Bug } from 'lucide-react';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const prompt = "Transform this person into an epic superhero with amazing powers, wearing a stunning costume with vibrant colors and heroic pose";
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationStatus, setTransformationStatus] = useState<'processing' | 'completed' | 'error' | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const handleImageSelect = (file: File) => {
    console.log('🖼️ Image selected:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
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
    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }

    console.log('🎯 Starting transformation process...', {
      fileName: selectedImage.name,
      prompt: prompt.trim(),
      debugMode
    });

    setIsTransforming(true);
    setTransformationStatus('processing');
    setResultImage(null);

    let loadingToastId: string | number | undefined;

    try {
      // Start the transformation
      console.log('📤 Calling startTransformation...');
      const response = await KimeraApiService.startTransformation(selectedImage, prompt);
      
      console.log('✅ Transformation started, polling for completion...', response);
      toast.success('Transformation started! Processing your image...');

      // Poll for completion with a loading toast
      const finalImageUrl = await KimeraApiService.pollForCompletion(
        response.id,
        (status, attempt) => {
          console.log(`🔄 Status update (attempt ${attempt}):`, status);
          if (attempt === 1) {
            loadingToastId = toast.loading(`Processing... Status: ${status}`);
          }
        }
      );

      // Dismiss the loading toast
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      console.log('🎉 Transformation completed!', finalImageUrl);
      setResultImage(finalImageUrl);
      setTransformationStatus('completed');
      toast.success('Image transformation completed!');
    } catch (error) {
      // Dismiss the loading toast if it exists
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      console.error('❌ Transformation error:', error);
      setTransformationStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to transform image: ${errorMessage}`);
      
      if (debugMode) {
        console.table({
          'Image Size': selectedImage?.size,
          'Prompt Length': prompt.length,
          'Error': errorMessage
        });
      }
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
              Upload your photo and watch as AI transforms you into an epic superhero with amazing powers!
            </p>
            
            {/* Debug Toggle */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bug className="w-3 h-3" />
                Debug Mode: {debugMode ? 'ON' : 'OFF'}
              </button>
            </div>
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
            
            <div className="text-center p-6 bg-surface border border-border/50 rounded-lg shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Transform!</h3>
              <p className="text-muted-foreground mb-4">Upload your image and we'll transform you into an amazing superhero!</p>
              <button
                onClick={handleTransform}
                disabled={!selectedImage || isTransforming}
                className="px-6 py-3 bg-gradient-primary hover:shadow-glow transition-all duration-300 rounded-lg font-medium text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTransforming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2 inline-block" />
                    Creating Superhero...
                  </>
                ) : (
                  'Transform into Superhero'
                )}
              </button>
            </div>
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