// NEW Deepgram SDK syntax
const { createClient } = require('@deepgram/sdk');

class DeepgramService {
  constructor() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (!apiKey || apiKey === 'your_deepgram_api_key_here') {
      console.error('⚠️  WARNING: Deepgram API key is not set in .env file');
      console.error('   Get your free key at: https://console.deepgram.com/signup');
      console.error('   Then add: DEEPGRAM_API_KEY=your_key_here to .env file');
      
      this.deepgram = null;
      this.isConfigured = false;
    } else {
      // NEW: Use createClient instead of new Deepgram()
      this.deepgram = createClient(apiKey);
      this.isConfigured = true;
      console.log('✅ Deepgram service initialized (v2 SDK)');
    }
  }

  async transcribeAudio(audioBuffer, options = {}) {
    // Check if Deepgram is configured
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Deepgram API key not configured. Please add DEEPGRAM_API_KEY to .env file',
        transcript: 'SAMPLE: Add your Deepgram API key to .env for real transcription.',
      };
    }

    try {
      // NEW SDK syntax
      const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: options.language || 'en',
          punctuate: true,
          utterances: true,
          ...options
        }
      );

      if (error) {
        console.error('Deepgram API error:', error);
        return {
          success: false,
          error: error.message || 'Deepgram API error',
        };
      }

      // Extract transcript from new response format
      const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

      if (transcript) {
        return {
          success: true,
          transcript: transcript,
          fullResponse: result,
        };
      } else {
        return {
          success: false,
          error: 'No transcription results',
          fullResponse: result,
        };
      }
    } catch (error) {
      console.error('Deepgram transcription error:', error.message);
      return {
        success: false,
        error: error.message,
        transcript: `ERROR: ${error.message}`,
      };
    }
  }
}

// Export instance
module.exports = new DeepgramService();