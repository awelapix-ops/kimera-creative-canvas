import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { TransformationPrompt } from '@/components/TransformationPrompt';
import { ResultDisplay } from '@/components/ResultDisplay';
import { KimeraApiService } from '@/services/kimeraApi';
import { toast } from 'sonner';
import { Sparkles, Zap } from 'lucide-react';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const prompt = "Transform this person into an epic superhero with extraordinary powers, wearing a stunning costume in vibrant colors. Show the person in a full-length flying pose, their entire body visible from head to toe. Place them soaring through a dramatic sunset golden hour sky, with glowing clouds, warm cinematic light, and a sense of motion that highlights their heroic presence.";
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationStatus, setTransformationStatus] = useState<'processing' | 'completed' | 'error' | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  

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
      prompt: prompt.trim()
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
            Perfect for Marketing Campaigns
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create engaging superhero content that boosts brand awareness and drives social media engagement
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Social Media Ready</h3>
            <p className="text-muted-foreground">
              Generate viral-worthy superhero content perfect for Instagram, TikTok, and Facebook campaigns
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Brand Engagement</h3>
            <p className="text-muted-foreground">
              Increase customer engagement with fun, shareable superhero transformations of your audience
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
              <div className="w-8 h-8 border-2 border-current rounded border-primary-foreground"></div>
            </div>
            <h3 className="text-xl font-semibold text-foreground">Campaign Boost</h3>
            <p className="text-muted-foreground">
              Drive higher conversion rates with unique, personalized superhero content for your marketing campaigns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;