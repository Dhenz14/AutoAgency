import Anthropic from "@anthropic-ai/sdk";

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set. Please add your Claude API key in the environment secrets.");
  }
  return new Anthropic({ apiKey });
};

export interface GeneratedContent {
  shortFormPosts: Array<{ text: string; suggestedAccount?: string }>;
  replyAngles: Array<{ trigger: string; angle: string }>;
  longFormDrafts: Array<{ title: string; content: string; platforms: string[] }>;
}

export async function generateContentFromSource(
  sourceText: string,
  title: string,
  shortFormPct: number,
  replyOpsPct: number,
  longFormPct: number,
  accountHandles: string[]
): Promise<GeneratedContent> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are an autonomous social media content engine. Given this source material, generate content assets.

SOURCE TITLE: ${title}
SOURCE TEXT:
${sourceText.substring(0, 6000)}

AVAILABLE ACCOUNTS: ${accountHandles.join(", ")}

DISTRIBUTION:
- ${shortFormPct}% should be short-form posts (tweets, X posts)
- ${replyOpsPct}% should be reply angles (triggers + talking points for reply guy operations)
- ${longFormPct}% should be long-form drafts (Medium/LinkedIn articles)

Generate content in this exact JSON format:
{
  "shortFormPosts": [
    {"text": "The actual tweet/post text", "suggestedAccount": "@handle_from_available_list"}
  ],
  "replyAngles": [
    {"trigger": "When someone talks about X topic", "angle": "The counterpoint or insight to reply with"}
  ],
  "longFormDrafts": [
    {"title": "Article Title", "content": "First 2-3 paragraphs of the article...", "platforms": ["Medium", "LinkedIn"]}
  ]
}

Rules:
- Short-form posts: Punchy, contrarian, no hashtags, no generic AI words like "delve" or "tapestry"
- Reply angles: Give specific conversation triggers and smart angles to inject
- Long-form: Write compelling opening paragraphs that hook the reader
- Match each short-form post to one of the available accounts based on likely niche fit
- Generate at least 5 short-form posts, 3 reply angles, and 1 long-form draft

Return ONLY valid JSON, no markdown code blocks.`
      }
    ]
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as GeneratedContent;
  } catch {
    return {
      shortFormPosts: [{ text: "Content generation completed but parsing failed. Raw response saved.", suggestedAccount: accountHandles[0] }],
      replyAngles: [{ trigger: "General topic discussion", angle: responseText.substring(0, 200) }],
      longFormDrafts: []
    };
  }
}

export async function generateReply(
  tweetContent: string,
  tweetAuthor: string,
  niche: string,
  brandVoice?: string
): Promise<string> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an intelligent reply guy on X/Twitter. Generate a single, highly engaging reply.

ORIGINAL TWEET by ${tweetAuthor}:
"${tweetContent}"

NICHE: ${niche}
${brandVoice ? `BRAND VOICE: ${brandVoice}` : ""}

Rules:
- Be insightful, slightly contrarian, but respectful
- Add genuine value to the conversation
- No generic agreement ("Great point!")
- No hashtags
- No AI words like "delve", "tapestry", "testament"
- Keep it under 280 characters
- Sound human, not corporate

Return ONLY the reply text, nothing else.`
      }
    ]
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

export async function analyzeAccountPerformance(
  handle: string,
  niche: string,
  impressions: number,
  growth: string
): Promise<{ recommendation: string; suggestedNichePivot: string; formatAdvice: string }> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this social media account and provide growth recommendations.

ACCOUNT: ${handle}
NICHE: ${niche}
30-DAY IMPRESSIONS: ${impressions}
GROWTH TREND: ${growth}

Provide analysis in this exact JSON format:
{
  "recommendation": "A specific, actionable recommendation in 2-3 sentences",
  "suggestedNichePivot": "A suggested niche pivot if current one isn't working, or 'Stay in current niche' if it's fine",
  "formatAdvice": "Advice on post format (threads vs singles, hot takes vs data, etc)"
}

Return ONLY valid JSON.`
      }
    ]
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      recommendation: "Unable to analyze. Check API key configuration.",
      suggestedNichePivot: "Stay in current niche",
      formatAdvice: "Continue current format"
    };
  }
}