/**
 * Checks if the app is in demo mode for SEO data (no SerpApi key configured).
 */
export function isDemoMode(): boolean {
    const serpApiKey = process.env.SERPAPI_API_KEY || '';

    return (
        !serpApiKey || serpApiKey.includes('your_') || serpApiKey.includes('_here')
    );
}

/**
 * Checks if AI reports are available (OpenAI or Gemini key configured).
 */
export function isAiAvailable(): boolean {
    const openaiKey = process.env.OPENAI_API_KEY || '';
    const geminiKey = process.env.GEMINI_API_KEY || '';

    const hasOpenai = openaiKey && !openaiKey.includes('your_') && !openaiKey.includes('_here');
    const hasGemini = geminiKey && !geminiKey.includes('your_') && !geminiKey.includes('_here');

    return !!(hasOpenai || hasGemini);
}
