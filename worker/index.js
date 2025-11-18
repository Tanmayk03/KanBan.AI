require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('🔑 API Key loaded:', GEMINI_API_KEY ? '✅ Yes' : '❌ Missing');

// ============================================
// Automatic Task Classification
// ============================================
async function classifyTask(taskDescription) {
  const classificationPrompt = `Classify this task into EXACTLY ONE category. Reply with ONLY the category name, nothing else.

Categories:
- code-generation (if user wants to CREATE/WRITE/BUILD code or program)
- code-explanation (if user wants to UNDERSTAND/EXPLAIN existing code)
- bug-fix (if user wants to FIX/DEBUG code errors)
- translation (if user wants to TRANSLATE text to another language)
- sentiment-analysis (if user wants to ANALYZE emotions/opinions/sentiment)
- summarization (if user wants to SUMMARIZE/CONDENSE text)
- document-analysis (if user wants to EXTRACT/ANALYZE document information)
- content-polishing (if user wants to IMPROVE/EDIT/PROOFREAD text)
- creative-writing (if user wants to WRITE stories/poems/creative content)
- research (if user wants to FIND/INVESTIGATE information)

Examples:
"write a python function to sort array" → code-generation
"explain this javascript code: function add(a,b)" → code-explanation
"my code has an error: TypeError undefined" → bug-fix
"translate hello world to french" → translation
"analyze sentiment of: I love this product" → sentiment-analysis

Task: "${taskDescription}"

Reply with ONLY the category name:`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
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
          temperature: 0.1,  // Low temperature for consistent classification
          maxOutputTokens: 50
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Classification API Error:', data);
      return 'summarization';
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const rawClassification = data.candidates[0].content.parts[0].text.trim().toLowerCase();
      console.log(`🔍 Raw classification response: "${rawClassification}"`);
      
      // Clean up the response - remove any extra text
      let classification = rawClassification
        .replace(/^(the category is|category:|answer:)/i, '')
        .trim();
      
      // Validate classification
      const validSteps = [
        'summarization', 'translation', 'sentiment-analysis',
        'code-generation', 'code-explanation', 'bug-fix',
        'document-analysis', 'content-polishing', 'creative-writing',
        'research'
      ];
      
      // Find exact match or partial match
      for (const step of validSteps) {
        if (classification === step || classification.includes(step)) {
          console.log(`✅ Matched classification: "${step}"`);
          return step;
        }
      }
      
      console.log(`⚠️  No match found for: "${rawClassification}", defaulting to summarization`);
      return 'summarization';
    }
    
    return 'summarization';
    
  } catch (error) {
    console.error('❌ Classification error:', error.message);
    return 'summarization';
  }
}

// ============================================
// Enhanced workflow-specific prompts
// ============================================
async function processWithGemini(detectedWorkflow, inputText) {
  const workflowPrompts = {
    'summarization': `Summarize the following text in 2-3 concise sentences:\n\n${inputText}`,
    
    'translation': `Translate the following text to Spanish (or detect the target language from context). Provide ONLY the translation:\n\n${inputText}`,
    
    'sentiment-analysis': `Analyze the sentiment of this text. Provide:
1) Overall Sentiment: (Positive/Negative/Neutral/Mixed)
2) Confidence Score: (percentage)
3) Key Emotions Detected: (list main emotions)
4) Brief Explanation: (2-3 sentences)

Text to analyze: "${inputText}"`,
    
    'code-generation': `Generate clean, working, well-commented code based on this request. Include:
1) The complete code
2) Brief explanation of how it works
3) Example usage if applicable

Request: ${inputText}`,
    
    'code-explanation': `Explain the following code in detail. Include:
1) What the code does (high-level overview)
2) Step-by-step breakdown of key parts
3) Any important concepts or patterns used

Code: ${inputText}`,
    
    'bug-fix': `Analyze the following code/error and provide:
1) Identified Issue: What's wrong
2) Root Cause: Why it's happening
3) Fixed Code: Corrected version
4) Prevention Tips: How to avoid this in future

Code/Error: ${inputText}`,
    
    'document-analysis': `Analyze this document and extract:
1) Key Information: Main points and data
2) Structure: How it's organized
3) Summary: Brief overview
4) Insights: Important findings

Document: ${inputText}`,
    
    'content-polishing': `Improve and refine the following content. Provide:
1) Polished Version: Enhanced, error-free text
2) Changes Made: Brief list of improvements
3) Suggestions: Additional recommendations

Original Content: ${inputText}`,
    
    'creative-writing': `Create creative content based on this request. Be imaginative, engaging, and original:

${inputText}`,
    
    'research': `Research and provide comprehensive information on this topic. Include:
1) Overview: Brief introduction
2) Key Facts: Important information
3) Details: In-depth explanation
4) Sources: Where this information comes from

Topic: ${inputText}`
  };

  const prompt = workflowPrompts[detectedWorkflow] || workflowPrompts['summarization'];
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
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
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
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
    console.log(`\n[${task.id.substring(0, 8)}] 🔄 Processing: "${task.title}"`);
    
    let detectedWorkflow = null;
    
    // Auto-detect workflow type if task_type is 'auto'
    if (task.task_type === 'auto') {
      console.log(`[${task.id.substring(0, 8)}] 🤖 Auto-detecting workflow type...`);
      
      const taskDescription = task.title + (task.description ? ' - ' + task.description : '') + 
                            (task.input_data?.text ? ': ' + task.input_data.text : '');
      
      console.log(`[${task.id.substring(0, 8)}] 📝 Task description to classify: "${taskDescription.substring(0, 100)}..."`);
      
      detectedWorkflow = await classifyTask(taskDescription);
      
      console.log(`[${task.id.substring(0, 8)}] 🎯 Final detected workflow: ${detectedWorkflow}`);
      
      // Update task with detected workflow
      await supabase.from('tasks').update({
        detected_workflow: detectedWorkflow
      }).eq('id', task.id);
      
      await supabase.from('task_logs').insert({
        task_id: task.id,
        event: 'workflow_detected',
        message: `AI detected workflow: ${detectedWorkflow}`
      });
    } else {
      // Map existing task_type to workflow
      const taskTypeToWorkflow = {
        'summarize': 'summarization',
        'translate': 'translation',
        'sentiment': 'sentiment-analysis',
        'code': 'code-generation',
        'ocr': 'document-analysis'
      };
      detectedWorkflow = taskTypeToWorkflow[task.task_type] || 'summarization';
    }
    
    await supabase.from('task_logs').insert({
      task_id: task.id,
      event: 'started',
      message: `Started processing with workflow: ${detectedWorkflow}`
    });

    const result = await processWithGemini(detectedWorkflow, task.input_data.text);
    const processingTime = Date.now() - startTime;

    await supabase.from('tasks').update({
      status: 'done',
      output_data: { 
        result: result,
        model: 'gemini-2.5-flash',
        processing_time_ms: processingTime,
        workflow_used: detectedWorkflow
      },
      completed_at: new Date().toISOString()
    }).eq('id', task.id);

    await supabase.from('task_logs').insert({
      task_id: task.id,
      event: 'completed',
      message: `Completed in ${processingTime}ms using ${detectedWorkflow}`,
      metadata: { 
        processing_time_ms: processingTime,
        workflow: detectedWorkflow
      }
    });

    console.log(`[${task.id.substring(0, 8)}] ✅ Done in ${processingTime}ms`);
    console.log(`📝 Preview: ${result.substring(0, 100)}...\n`);
    
  } catch (error) {
    console.error(`[${task.id.substring(0, 8)}] ❌ Error:`, error.message);
    
    await supabase.from('tasks').update({
      status: 'failed',
      output_data: { error: error.message }
    }).eq('id', task.id);

    await supabase.from('task_logs').insert({
      task_id: task.id,
      event: 'failed',
      message: `Failed: ${error.message}`
    });
  }
}

// Main worker loop
async function workerLoop() {
  console.log('🤖 Gemini AI Worker Started!');
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