require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  console.log('🔍 Checking available Gemini models...\n');
  console.log('API Key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 20)}...` : '❌ MISSING');
  console.log('');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error:', data);
      return;
    }
    
    if (data.models) {
      console.log('✅ Available Models:\n');
      data.models.forEach(model => {
        const methods = model.supportedGenerationMethods || [];
        if (methods.includes('generateContent')) {
          console.log(`📦 ${model.name}`);
          console.log(`   Display Name: ${model.displayName}`);
          console.log(`   Methods: ${methods.join(', ')}`);
          console.log('');
        }
      });
    } else {
      console.log('No models found');
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

listModels();