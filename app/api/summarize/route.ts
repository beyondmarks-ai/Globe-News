export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// We only need the Gemini SDK now!
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    // 1. Direct REST API Call to Firecrawl (Bypassing the buggy SDK)
    const firecrawlOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: targetUrl, // CRITICAL: We pass the specific news link here
        formats: ["markdown"],
        onlyMainContent: true, // Tells Firecrawl to ignore ads and sidebars
      }),
    };

    // Using the stable v1 scrape endpoint
    const response = await fetch(
      "https://api.firecrawl.dev/v1/scrape",
      firecrawlOptions
    );
    const scrapeResult = await response.json();

    if (!response.ok || !scrapeResult.success) {
      throw new Error(
        `Firecrawl API rejected the request: ${scrapeResult.error || "Unknown error"}`
      );
    }

    // 2. Extract Markdown and Image from the raw JSON response
    const markdown = scrapeResult.data?.markdown;
    const metadata = scrapeResult.data?.metadata || {};
    const imageUrl =
      metadata.ogImage || metadata.twitterImage || metadata.image || null;

    if (!markdown) {
      throw new Error(
        "Firecrawl connected, but returned no markdown text."
      );
    }

    // 3. Ask Gemini to structure the data
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an expert news analyst. Read this scraped markdown text of a news article and return a raw JSON object with these exact keys:
      "what": A 1-sentence summary of what happened.
      "why": A 1-sentence explanation of why it matters.
      "where": Specific location details mentioned.
      Do not include markdown blocks or \`\`\`json. Just the raw JSON.
      
      Article Text:
      ${markdown.substring(0, 4000)}
    `;

    const aiResult = await model.generateContent(prompt);
    let aiText = aiResult.response.text().trim();

    // 4. Clean up Gemini's response
    if (aiText.startsWith("```json")) aiText = aiText.replace(/```json/g, "");
    if (aiText.startsWith("```")) aiText = aiText.replace(/```/g, "");
    aiText = aiText.trim();

    const parsedSummary = JSON.parse(aiText);

    // 5. Send the perfect data package to your Map Popup!
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      what: parsedSummary.what || "Summary unavailable.",
      why: parsedSummary.why || "Context unavailable.",
      where: parsedSummary.where || "Location unverified.",
    });
  } catch (error: any) {
    console.error("Native Pipeline Error:", error);

    // 6. The Professional Fallback
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to process article",
      imageUrl:
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
      what: "This publisher's security firewall prevents automatic AI summarization.",
      why: "Click 'Read Full Article' below to view the story directly on the source website.",
      where: "Location available in full article.",
    });
  }
}
