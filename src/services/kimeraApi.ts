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
  output?: {
    output_image: string;
  };
}

export class KimeraApiService {
  private static readonly apiKey = '1b1c35dd33005efced81a13d0ccc768100c03a6c479895f28b0b4e7878321059';

  static getApiKey(): string {
    return this.apiKey;
  }

  private static async uploadImageToCloudinary(file: File): Promise<string> {
    console.log('📤 Converting image to base64...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    // Convert file to base64 for direct upload to Kimera API
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        console.log('✅ Image converted to base64', {
          base64Length: base64.length,
          preview: base64.substring(0, 100) + '...'
        });
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error('❌ Error converting image to base64:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  static async startTransformation(
    imageFile: File,
    prompt: string
  ): Promise<TransformationResponse> {

    console.log('🚀 Starting transformation...', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      prompt,
      apiKeyLength: this.apiKey.length
    });

    try {
      const imageData = await this.uploadImageToCloudinary(imageFile);
      
      const requestBody = {
        pipeline_id: "4avRtmmE",
        inputs: {
          model_hidden: "ChatGPT image",
          gen_text: prompt,
          user_image: imageData
        }
      };

      console.log('📡 Making API request to:', `${KIMERA_API_BASE}/pipeline/run`);
      console.log('📝 Request body:', {
        ...requestBody,
        inputs: {
          ...requestBody.inputs,
          user_image: `[BASE64_IMAGE_${imageData.length}_CHARS]`
        }
      });

      const response = await fetch(`${KIMERA_API_BASE}/pipeline/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API key.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Your API key may not have sufficient permissions.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Transformation started successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error starting transformation:', error);
      throw error;
    }
  }

  static async checkTransformationStatus(
    processId: string
  ): Promise<CompletedTransformationResponse> {

    console.log('🔄 Checking transformation status for ID:', processId);

    try {
      const response = await fetch(`${KIMERA_API_BASE}/pipeline/run/${processId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });

      console.log('📡 Status check response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Status check failed:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Status check failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Status response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error checking transformation status:', error);
      throw error;
    }
  }

  static async pollForCompletion(
    processId: string,
    onStatusUpdate?: (status: string, attempt: number) => void
  ): Promise<string> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    console.log('🔁 Starting polling for completion...', {
      processId,
      maxAttempts,
      intervalSeconds: 5
    });

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}`);

      try {
        const result = await this.checkTransformationStatus(processId);
        
        console.log(`📊 Status update (attempt ${attempts}):`, {
          status: result.status,
          hasOutput: !!result.output,
          outputImage: result.output?.output_image ? 'Present' : 'Missing'
        });

        if (onStatusUpdate) {
          onStatusUpdate(result.status, attempts);
        }

        if (result.status === 'Completed' && result.output?.output_image) {
          console.log('✅ Transformation completed successfully!');
          return result.output.output_image;
        }

        if (result.status === 'Failed' || result.status === 'Error') {
          console.error('❌ Transformation failed with status:', result.status);
          throw new Error(`Transformation failed with status: ${result.status}`);
        }

        // Wait 5 seconds before next check
        console.log('⏳ Waiting 5 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`❌ Error on polling attempt ${attempts}:`, error);
        if (attempts >= maxAttempts - 1) {
          console.error('❌ Max polling attempts reached, giving up');
          throw error;
        }
        console.log('⏳ Waiting 5 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.error('❌ Transformation timed out after', maxAttempts, 'attempts');
    throw new Error(`Transformation timed out after ${maxAttempts} attempts (${maxAttempts * 5 / 60} minutes)`);
  }
}