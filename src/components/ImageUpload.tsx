import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { CameraCapture } from './CameraCapture';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClearImage: () => void;
}

export function ImageUpload({ onImageSelect, selectedImage, onClearImage }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  React.useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [selectedImage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = async () => {
    // Check if we're running on a native platform with Capacitor
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });

        if (image.dataUrl) {
          // Convert base64 to File
          const response = await fetch(image.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          onImageSelect(file);
          toast.success('Photo captured successfully!');
        }
      } catch (error) {
        console.error('Camera error:', error);
        toast.error('Failed to capture photo. Please try again.');
      }
    } else {
      // Show camera interface for web browsers
      setShowCamera(true);
    }
  };

  const handleCameraCapture = (file: File) => {
    onImageSelect(file);
    setShowCamera(false);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  const handleClear = () => {
    onClearImage();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Card className="p-6 bg-surface border-border/50 shadow-card">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Upload Your Image</h3>
        
        {!selectedImage ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="ai"
                size="lg"
                onClick={handleUploadClick}
                className="h-32 flex-col gap-3"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Upload from Device</span>
              </Button>
              
              <Button
                variant="ai"
                size="lg"
                onClick={handleCameraClick}
                className="h-32 flex-col gap-3"
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm font-medium">Take Photo</span>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Supported formats: JPG, PNG, WebP, GIF
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-surface-elevated">
              {preview && (
                <img
                  src={preview}
                  alt="Selected"
                  className="w-full h-48 object-contain"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute top-2 right-2 bg-background/80 hover:bg-background/90"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={handleCameraClose}
        />
      )}
    </Card>
  );
}