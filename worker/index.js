require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('🔑 API Key loaded:', GEMINI_API_KEY ? '✅ Yes' : '❌ Missing');

// AI Processing using Gemini 2.5 Flash (Latest Model!)
async function processWithGemini(taskType, inputText) {
  const prompts = {
    summarize: `Summarize the following text in 2-3 concise sentences:\n\n${inputText}`,
    translate: `Translate the following text to Spanish. Only provide the translation:\n\n${inputText}`,
    sentiment: `Analyze the sentiment of this text. Provide: 1) Sentiment (Positive/Negative/Neutral), 2) Brief explanation.\n\nText: ${inputText}`,
    ocr: `Extract and organize any structured information from this text:\n\n${inputText}`,
    code: `Generate clean, working code based on this request:\n\n${inputText}`
  };

  const prompt = prompts[taskType] || prompts.summarize;
  
  try {
    // Using Gemini 2.5 Flash - Latest model!
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
      throw new Error(data.error?.message || 'Unknown API error');
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid response structure from Gemini');
    
  } catch (error) {
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

// Process a single task
async function processTask(task) {
  const startTime = Date.now();
  
  try {
    console.log(`\n[${task.id.substring(0, 8)}] 🔄 Processing ${task.task_type}: "${task.title}"`);
    
    await supabase.from('task_logs').insert({
      task_id: task.id,
      event: 'started',
      message: `Started processing ${task.task_type} task with Gemini 2.5 Flash`
    });

    const result = await processWithGemini(task.task_type, task.input_data.text);
    const processingTime = Date.now() - startTime;

    await supabase.from('tasks').update({
      status: 'done',
      output_data: { 
        result: result,
        model: 'gemini-2.5-flash',
        processing_time_ms: processingTime
      },
      completed_at: new Date().toISOString()
    }).eq('id', task.id);

    await supabase.from('task_logs').insert({
      task_id: task.id,
      event: 'completed',
      message: `✅ Completed in ${processingTime}ms`,
      metadata: { processing_time_ms: processingTime }
    });

    console.log(`[${task.id.substring(0, 8)}] ✅ Done in ${processingTime}ms`);
    console.log(`📝 Result: ${result.substring(0, 100)}...\n`);
    
  } catch (error) {
    console.error(`[${task.id.substring(0, 8)}] ❌ Error:`, error.message);
    
    await supabase.from('tasks').update({
      status: 'failed',
      output_data: { error: error.message }
    }).eq('id', task.id);

    await supabase.from('task_logs').insert({
      task_id: task.id,
      event: 'failed',
      message: `❌ Failed: ${error.message}`
    });
  }
}

// Main worker loop
async function workerLoop() {
  console.log('🤖 Gemini 2.5 Flash AI Worker Started!');
  console.log('📡 Polling for tasks every 3 seconds...\n');
  
  setInterval(async () => {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'in_progress')
        .is('output_data', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (tasks && tasks.length > 0) {
        console.log(`🔔 Found ${tasks.length} task(s) to process`);
        for (const task of tasks) {
          await processTask(task);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('❌ Worker error:', error.message);
    }
  }, 3000);
}

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

workerLoop();