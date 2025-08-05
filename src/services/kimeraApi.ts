const KIMERA_API_BASE = 'https://api.kimera.ai/v1';

export interface TransformationRequest {
  model_hidden: string;
  gen_text: string;
  user_image: string;
}

export interface TransformationResponse {
  id: string;
  status: string;
  message: string;
  source: string;
  request_payload: {
    pipeline_id: string;
    inputs: TransformationRequest;
  };
}

export interface CompletedTransformationResponse {
  id: string;
  status: string;
  message: string;
  output: {
    output_image: string;
  };
}

export class KimeraApiService {
  private static async uploadImageToCloudinary(file: File): Promise<string> {
    // Convert file to base64 for direct upload to Kimera API
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static async startTransformation(
    imageFile: File,
    prompt: string
  ): Promise<TransformationResponse> {
    try {
      const imageData = await this.uploadImageToCloudinary(imageFile);
      
      const response = await fetch(`${KIMERA_API_BASE}/pipeline/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipeline_id: "4avRtmmE",
          inputs: {
            model_hidden: "ChatGPT image",
            gen_text: prompt,
            user_image: imageData
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error starting transformation:', error);
      throw error;
    }
  }

  static async checkTransformationStatus(
    processId: string
  ): Promise<CompletedTransformationResponse> {
    try {
      const response = await fetch(`${KIMERA_API_BASE}/pipeline/run/${processId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking transformation status:', error);
      throw error;
    }
  }

  static async pollForCompletion(
    processId: string,
    onStatusUpdate?: (status: string) => void
  ): Promise<string> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const result = await this.checkTransformationStatus(processId);
        
        if (onStatusUpdate) {
          onStatusUpdate(result.status);
        }

        if (result.status === 'Completed' && result.output?.output_image) {
          return result.output.output_image;
        }

        if (result.status === 'Failed' || result.status === 'Error') {
          throw new Error('Transformation failed');
        }

        // Wait 5 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }

    throw new Error('Transformation timed out');
  }
}