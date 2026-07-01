const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require("../utils/asyncHandler");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are a professional writing assistant for a community management app.
  Your task is to provide 3 DISTINCT, professional rephrased versions of a resident's issue report.
  
  Instructions:
  1. Take the provided description and title.
  2. Generate 3 variants: 
     - Variant 1: Precise & Direct (Short and clear)
     - Variant 2: Formal & Detailed (Comprehensive and professional)
     - Variant 3: Community-Focused (Polite and collaborative)
  3. No conversational filler.
  4. Response MUST be a valid JSON array of 3 strings.`
});

/**
 * Generate multiple AI rephrase suggestions
 * @route POST /api/v1/autocomplete
 */
exports.generateSuggestion = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title && !description) {
        return res.status(400).json({ message: "At least a title or description is required" });
    }

    const prompt = `Return a JSON array of 3 professional rephrased options for this issue:
  Title: ${title}
  User's Draft: ${description || "(No description provided yet)"}
  
  Example format: ["Option 1...", "Option 2...", "Option 3..."]`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean up markdown if AI returns it
        text = text.replace(/```json|```/g, '');

        const suggestions = JSON.parse(text);

        res.json({
            suggestions: Array.isArray(suggestions) ? suggestions : [text]
        });
    } catch (error) {
        console.error("Gemini AI Error:", error.message);

        // Fallback: Still return 3 options but using pre-defined templates
        const cleanDesc = description || `the maintenance issue regarding "${title}"`;
        const fallbacks = [
            `I'm reporting the following issue: ${title}. ${cleanDesc}.`,
            `I am writing to formally report a maintenance concern regarding ${title}. ${cleanDesc}. This requires prompt attention to ensure community safety.`,
            `Hello, I've noticed an issue with ${title}: ${cleanDesc}. I would appreciate it if the management could look into this at their earliest convenience. Thank you!`
        ];

        res.json({
            suggestions: fallbacks,
            isFallback: true,
            message: "AI refined template (service at capacity)"
        });
    }
});
