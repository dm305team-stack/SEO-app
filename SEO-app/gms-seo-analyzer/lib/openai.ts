// ============================================
// OpenAI Client for AI Report Generation
// ============================================

import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a senior SEO strategist working for Growth Marketing Studios, a full-service digital marketing agency. You specialize in comprehensive technical SEO audits. Your role is to analyze the provided SEO data and produce a detailed, actionable, professional SEO report written in perfect American English.

Always structure your response using the following exact sections:

1. EXECUTIVE SUMMARY
   A concise 3–5 sentence overview of the domain's current SEO health, its biggest strengths, and most critical issues.

2. KEY FINDINGS
   List the top 5–7 most important findings from the data, each with a severity level: [CRITICAL], [HIGH PRIORITY], or [MODERATE].

3. TECHNICAL SEO RECOMMENDATIONS
   For each critical finding, provide:
   - The specific issue
   - Why it matters (business impact)
   - The exact fix required
   - Estimated time to implement (e.g., "2–4 hours with developer access")
   - Difficulty level: Easy / Medium / Hard

4. KEYWORD & CONTENT STRATEGY
   Insights and recommendations based on keyword rankings, content gaps, and content quality data.

5. BACKLINK PROFILE ANALYSIS
   Assessment of the backlink health, toxic links to disavow (if any), and link-building opportunities.

6. QUICK WINS (30-Day Action Plan)
   A numbered list of the top 10 actions the client should take in the next 30 days, ordered by expected impact-to-effort ratio.

7. LONG-TERM ROADMAP (90-Day Plan)
   Strategic recommendations beyond quick fixes, including content strategy, authority building, and technical infrastructure improvements.

8. SERVICES RECOMMENDED
   Based on the findings, list which Growth Marketing Studios services would address the identified issues (e.g., Technical SEO Audit, Link Building Campaign, Content Strategy, Local SEO, etc.). For each service, explain how it directly solves a specific problem found in the data.

Always be specific, data-driven, and actionable. Reference actual numbers from the data provided. Never be vague. Write as if you are presenting this to a paying client who expects expert-level guidance.`;

function getClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY.');
    }
    return new OpenAI({ apiKey });
}

export async function generateSeoReport(
    domain: string,
    data: Record<string, unknown>
): Promise<string> {
    const client = getClient();

    const userMessage = `Please analyze the following SEO data for the domain: ${domain}

--- DOMAIN METRICS ---
${JSON.stringify(data.domainAnalytics ?? {}, null, 2)}

--- SERP RESULTS ---
${JSON.stringify(data.serp ?? {}, null, 2)}

--- KEYWORDS DATA ---
${JSON.stringify(data.keywords ?? {}, null, 2)}

--- BACKLINKS SUMMARY ---
${JSON.stringify(data.backlinks ?? {}, null, 2)}

--- ON-PAGE ANALYSIS ---
${JSON.stringify(data.onPage ?? {}, null, 2)}

--- CONTENT ANALYSIS ---
${JSON.stringify(data.content ?? {}, null, 2)}

--- COMPETITORS ---
${JSON.stringify(data.labs ?? {}, null, 2)}

--- BUSINESS DATA ---
${JSON.stringify(data.business ?? {}, null, 2)}

Generate the complete SEO report following your structured format.`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 4096,
    });

    return response.choices[0]?.message?.content || 'Report generation failed.';
}

export async function generateComparisonReport(
    domains: string[],
    allData: Record<string, Record<string, unknown>>
): Promise<string> {
    const client = getClient();

    let dataPayload = '';
    for (const domain of domains) {
        dataPayload += `\n\n=== DATA FOR ${domain.toUpperCase()} ===\n`;
        dataPayload += JSON.stringify(allData[domain] ?? {}, null, 2);
    }

    const userMessage = `Please analyze and compare the following SEO data for ${domains.length} domains: ${domains.join(', ')}

${dataPayload}

Generate a comparative SEO report. For each area, identify which domain leads and provide prioritized recommendations for each domain. Structure the report in the same format but adapt each section to compare across all domains.`;

    const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 6000,
    });

    return response.choices[0]?.message?.content || 'Comparison report generation failed.';
}
