import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Configuration ---

// ⚠️ HARDCODED KEY FOR TESTING ONLY
// Ideally, move this to a .env file later for security.
const apiKey = "AIzaSyDIwm-KMm0wRpUUvz1w2omxth_9Ym9As5A";

const genAI = new GoogleGenerativeAI(apiKey);

// We use 'gemini-1.5-flash' because it is fast, supports images, and is great for JSON.
const MODEL_NAME = 'gemini-1.5-flash'; 
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// --- Types ---

export interface SearchResult {
  results: any[];
  insight: string;
}

export interface VaultResult {
  results: any[];
  comment: string;
}

// --- The Master Brain Service ---

export const GeminiService = {

  /**
   * Function 1: Universal Search
   * The "Smart Search" for Videos, Audio, and Articles.
   * Feeds the dataset to Gemini to find semantic matches and generate a witty insight.
   */
  async universalSearch(userQuery: string, dataset: any[], sectionName: string): Promise<SearchResult> {
    try {
      // 1. Prepare the context (limit size to prevent errors)
      const dataContext = JSON.stringify(dataset).substring(0, 20000);

      const prompt = `
        You are the intelligent search core for the "ENFOCO" dashboard.
        Current Section: ${sectionName}
        User Query: "${userQuery}"
        
        Dataset:
        ${dataContext}
        
        Task: 
        1. Analyze the dataset and find items that semantically match the User Query.
        2. Return a valid JSON object with two properties:
           - "results": an array of the matching item objects (maintain original structure).
           - "insight": a short, witty, sci-fi style sentence explaining why you chose them (e.g., "I found 3 ancient broadcasts related to 'Mars' in the Sonic Archive.").
        
        IMPORTANT: Return ONLY raw JSON. No markdown formatting (no \`\`\`json).
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response just in case the model adds markdown
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(cleanJson) as SearchResult;

    } catch (error) {
      console.error("Universal Search Error:", error);
      // Fallback Mode so the app doesn't crash
      return {
        results: dataset.slice(0, 2), 
        insight: `[OFFLINE PROTOCOL] Rerouting... displaying cached data for "${userQuery}".`
      };
    }
  },

  /**
   * Function 2: Deep Vault Search
   * Searches the user's saved storage (Vault) with a "Security Clearance" persona.
   */
  async deepVaultSearch(userQuery: string, allFiles: any[]): Promise<VaultResult> {
    try {
      const prompt = `
        You are the Vault Security AI (Level 9 Clearance).
        User Query: "${userQuery}"
        
        File Manifest:
        ${JSON.stringify(allFiles)}
        
        Task:
        1. Filter files based on the query, checking names, types, and implied metadata.
        2. Return a valid JSON object: { "results": [files], "comment": "string" }.
        3. The "comment" must sound like a high-tech security system (e.g., "Accessing encrypted sector...", "Decryption complete. 2 files found.", "Clearance granted.").
        
        IMPORTANT: Return ONLY raw JSON. No markdown.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(cleanJson) as VaultResult;

    } catch (error) {
      console.error("Vault Search Error:", error);
      return {
        results: allFiles.filter(f => f.name.toLowerCase().includes(userQuery.toLowerCase())),
        comment: ":: SECURITY ALERT :: External uplink failed. Switching to local keyword match."
      };
    }
  },

  /**
   * Function 3: Chat With Context
   * Powers the "Chat" button for Books and Articles.
   * Acts as an expert tutor/analyst.
   */
  async chatWithContext(contextData: string, userMessage: string): Promise<string> {
    try {
      const prompt = `
        Context Data: 
        "${contextData.substring(0, 10000)}"
        
        You are an expert tutor and analyst within the ENFOCO system. 
        The user is asking a question about the context above.
        User Message: "${userMessage}"
        
        Instructions:
        - Answer concisely (max 2-3 sentences).
        - Be insightful, professional, and slightly futuristic in tone.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error("Chat Error:", error);
      return "I cannot access the neural link right now. Please try again later.";
    }
  },

  /**
   * Function 4: Analyze Visual
   * For the Image Dropzone. Describes location, tech, and hidden details.
   */
  async analyzeVisual(file: File): Promise<string> {
    try {
      const base64Data = await fileToGenerativePart(file);

      const prompt = `
        Analyze this image for the ENFOCO Visual Archive.
        Task:
        1. Describe the location and environment.
        2. Identify any visible technology or unique objects.
        3. Mention any "hidden" details a casual observer might miss.
        Tone: Cinematic, sci-fi, and analytical. Keep it under 50 words.
      `;

      // gemini-1.5-flash supports images natively
      const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: file.type } }]);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error("Vision Error:", error);
      return ":: VISUAL SENSOR OFFLINE :: Unable to process image data.";
    }
  }
};

// --- Helper Functions ---

async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}