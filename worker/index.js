require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('🔑 API Key loaded:', GEMINI_API_KEY ? '✅ Yes' : '❌ Missing');

// ============================================
// NEW: Automatic Task Classification
// ============================================
async function classifyTask(taskDescription) {
  const classificationPrompt = `You are an AI Workflow Engine for a Kanban automation system.
Your job is to read a user's task and decide the MOST appropriate next action.
You must classify the task into exactly ONE of the following steps:

- summarization: Tasks asking to summarize long text, articles, documents, or content
- translation: Tasks asking to translate text from one language to another
- sentiment-analysis: Tasks asking to analyze emotions, opinions, or sentiment in text
- code-generation: Tasks asking to write new code, create programs, or build applications
- code-explanation: Tasks asking to explain how code works or what it does
- bug-fix: Tasks asking to fix errors, debug code, or resolve issues in existing code
- document-analysis: Tasks asking to analyze, extract information from, or understand documents
- content-polishing: Tasks asking to improve, edit, proofread, or refine existing content
- creative-writing: Tasks asking to write stories, poems, articles, or creative content
- research: Tasks asking to find information, investigate topics, or gather data
- unknown: Use this only if you truly cannot decide

CRITICAL RULES:
1. Respond with ONLY the category name (e.g., "code-generation")
2. Do NOT include explanations, reasoning, or additional text
3. Choose the SINGLE most appropriate category
4. Be decisive - avoid "unknown" unless absolutely necessary

Task to classify: ${taskDescription}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: classificationPrompt
          }]
        }],
        generationConfig: {
          temperature: 0,  // Deterministic classification
          maxOutputTokens: 50
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Classification API Error:', data);
      return 'unknown';
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const classification = data.candidates[0].content.parts[0].text.trim().toLowerCase();
      
      // Validate classification
      const validSteps = [
        'summarization', 'translation', 'sentiment-analysis',
        'code-generation', 'code-explanation', 'bug-fix',
        'document-analysis', 'content-polishing', 'creative-writing',
        'research', 'unknown'
      ];
      
      if (validSteps.includes(classification)) {
        return classification;
      }
      return 'unknown';
    }
    
    return 'unknown';
    
  } catch (error) {
    console.error('❌ Classification error:', error.message);
    return 'unknown';
  }
}

// ============================================
// Map auto-detected categories to task types
// ============================================
function mapClassificationToTaskType(classification) {
  const mapping = {
    'summarization': 'summarize',
    'translation': 'translate',
    'sentiment-analysis': 'sentiment',
    'code-generation': 'code',
    'code-explanation': 'code',
    'bug-fix': 'code',
    'document-analysis': 'ocr',
    'content-polishing': 'summarize',
    'creative-writing': 'code',
    'research': 'summarize',
    'unknown': 'summarize'
  };
  
  return mapping[classification] || 'summarize';
}

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
    
    // NEW: Auto-detect workflow type if not specified or if task_type is 'auto'
    let actualTaskType = task.task_type;
    let detectedWorkflow = null;
    
    if (!task.task_type || task.task_type === 'auto') {
      console.log(`[${task.id.substring(0, 8)}] 🤖 Auto-detecting workflow type...`);
      
      const taskDescription = task.title + (task.input_data?.text ? ': ' + task.input_data.text : '');
      detectedWorkflow = await classifyTask(taskDescription);
      actualTaskType = mapClassificationToTaskType(detectedWorkflow);
      
      console.log(`[${task.id.substring(0, 8)}] 🎯 Detected: ${detectedWorkflow} → ${actualTaskType}`);
      
      // Update task with detected workflow
      await supabase.from('tasks').update({
        task_type: actualTaskType,
        detected_workflow: detectedWorkflow
      }).eq('id', task.id);
    }
    
    await supabase.from('task_logs').insert({
      task_id: task.id,
      event: 'started',
      message: `Started processing ${actualTaskType} task with Gemini 2.5 Flash${detectedWorkflow ? ` (detected: ${detectedWorkflow})` : ''}`
    });

    const result = await processWithGemini(actualTaskType, task.input_data.text);
    const processingTime = Date.now() - startTime;

    await supabase.from('tasks').update({
      status: 'done',
      output_data: { 
        result: result,
        model: 'gemini-2.5-flash',
        processing_time_ms: processingTime,
        detected_workflow: detectedWorkflow
      },
      completed_at: new Date().toISOString()
    }).eq('id', task.id);

    await supabase.from('task_logs').insert({
      task_id: task.id,
      event: 'completed',
      message: `✅ Completed in ${processingTime}ms`,
      metadata: { 
        processing_time_ms: processingTime,
        detected_workflow: detectedWorkflow
      }
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
  console.log('🧠 Auto Task Classification: ENABLED');
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