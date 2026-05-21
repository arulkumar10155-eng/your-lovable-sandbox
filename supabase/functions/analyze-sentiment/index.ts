import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keyword-based sentiment analysis
const sentimentKeywords = {
  angry: {
    tamil: ['கோபம்', 'வெறுப்பு', 'கொடுமை', 'அநீதி', 'ஏமாற்றம்', 'அவமானம்', 'கொலை', 'சாவு', 'அழிவு'],
    english: ['angry', 'furious', 'outrage', 'terrible', 'disgusting', 'worst', 'hate', 'corrupt', 'scam', 'fraud', 'cheating', 'injustice', 'death', 'kill', 'destroy']
  },
  negative: {
    tamil: ['பிரச்சனை', 'கஷ்டம்', 'சிரமம்', 'தாமதம்', 'மோசம்', 'இல்லை', 'போதாது', 'குறை'],
    english: ['problem', 'issue', 'bad', 'poor', 'delay', 'lack', 'shortage', 'missing', 'broken', 'failed', 'difficult', 'struggle', 'suffering', 'complaint', 'grievance']
  },
  demanding: {
    tamil: ['உடனடி', 'தேவை', 'கோரிக்கை', 'வேண்டும்', 'செய்யுங்கள்', 'நடவடிக்கை'],
    english: ['immediately', 'urgent', 'demand', 'need', 'must', 'require', 'action', 'now', 'please fix', 'solve', 'implement', 'provide', 'give us']
  },
  positive: {
    tamil: ['நன்றி', 'நல்ல', 'சிறந்த', 'ஆதரவு', 'மகிழ்ச்சி', 'வாழ்த்து', 'பாராட்டு'],
    english: ['good', 'great', 'excellent', 'thank', 'appreciate', 'support', 'happy', 'wonderful', 'amazing', 'best', 'congratulations', 'proud', 'hope']
  }
};

function analyzeWithKeywords(text: string): { sentiment: string; score: number } {
  const lowerText = text.toLowerCase();
  
  let scores = { angry: 0, negative: 0, demanding: 0, positive: 0 };
  
  // Check each category
  for (const [category, keywords] of Object.entries(sentimentKeywords)) {
    const allKeywords = [...keywords.tamil, ...keywords.english];
    for (const keyword of allKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        scores[category as keyof typeof scores] += 1;
      }
    }
  }
  
  // Determine dominant sentiment
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore === 0) {
    return { sentiment: 'neutral', score: 0.5 };
  }
  
  // Find the sentiment with max score
  let dominantSentiment = 'neutral';
  for (const [category, score] of Object.entries(scores)) {
    if (score === maxScore) {
      dominantSentiment = category;
      break;
    }
  }
  
  // Calculate score based on sentiment
  const scoreMap: Record<string, number> = {
    angry: 0.15,
    negative: 0.3,
    demanding: 0.45,
    neutral: 0.5,
    positive: 0.8
  };
  
  return { 
    sentiment: dominantSentiment, 
    score: scoreMap[dominantSentiment] || 0.5 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type = 'suggestion' } = await req.json();
    
    if (!text || text.length < 10) {
      return new Response(
        JSON.stringify({ sentiment: 'neutral', score: 0.5 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, try keyword-based analysis
    const keywordResult = analyzeWithKeywords(text);
    
    // If we have a strong keyword match, use it
    if (keywordResult.sentiment !== 'neutral') {
      return new Response(
        JSON.stringify(keywordResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Otherwise, use AI for more nuanced analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify(keywordResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Analyze sentiment of political feedback from Tamil Nadu. Text may be in Tamil/English.

Classify as:
- "positive": Supportive, hopeful
- "neutral": Factual, balanced
- "negative": Complaints, frustration
- "angry": Strong outrage
- "demanding": Urgent requests

Respond ONLY with JSON: {"sentiment": "<category>", "score": <0.0-1.0>}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze: ${text.slice(0, 500)}` }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify(keywordResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    try {
      const jsonMatch = content.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify({
            sentiment: result.sentiment || 'neutral',
            score: typeof result.score === 'number' ? result.score : 0.5
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
    }

    return new Response(
      JSON.stringify(keywordResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ sentiment: 'neutral', score: 0.5 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});