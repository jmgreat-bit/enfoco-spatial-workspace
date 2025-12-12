
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the Google GenAI SDK
// API Key is strictly obtained from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash for speed and multimodal capabilities
const MODEL_NAME = 'gemini-2.5-flash';

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
   */
  async universalSearch(userQuery: string, dataset: any[], sectionName: string): Promise<SearchResult> {
    try {
      const dataContext = JSON.stringify(dataset).substring(0, 20000);

      const prompt = `
        You are the intelligent search core for the "ENFOCO" dashboard.
        Section: ${sectionName}
        User Query: "${userQuery}"
        
        Dataset:
        ${dataContext}
        
        Task: 
        1. Analyze the dataset and find items that semantically match the User Query.
        2. Return a valid JSON object with two properties:
           - "results": an array of the matching item objects (maintain original structure).
           - "insight": a short, witty, sci-fi style sentence explaining why you chose them.
        
        Constraint: Return strictly valid JSON.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      
      return JSON.parse(text) as SearchResult;

    } catch (error) {
      console.error("Universal Search Error:", error);
      // Fallback Mode
      return {
        results: dataset.slice(0, 2), 
        insight: `[OFFLINE PROTOCOL] Rerouting... displaying cached data for "${userQuery}".`
      };
    }
  },

  /**
   * Function 2: Deep Vault Search
   * Searches the user's saved storage (Vault).
   */
  async deepVaultSearch(userQuery: string, allFiles: any[]): Promise<VaultResult> {
    try {
      const prompt = `
        You are the Vault Security AI (Level 9 Clearance).
        User Query: "${userQuery}"
        
        File Manifest:
        ${JSON.stringify(allFiles)}
        
        Task:
        1. Filter files based on the query.
        2. Return a valid JSON object: { "results": [files], "comment": "string" }.
        3. The "comment" must sound like a high-tech security system.
        
        Constraint: Return strictly valid JSON.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");

      return JSON.parse(text) as VaultResult;

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
   * Powers the "Chat" button.
   */
  async chatWithContext(contextData: string, userMessage: string): Promise<string> {
    try {
      const prompt = `
        Context Data: 
        "${contextData.substring(0, 10000)}"
        
        You are an expert tutor/analyst. 
        User Message: "${userMessage}"
        
        Answer concisely (max 2-3 sentences), professional and futuristic tone.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      return response.text || "No response generated.";

    } catch (error) {
      console.error("Chat Error:", error);
      return "I cannot access the neural link right now. Please try again later.";
    }
  },

  /**
   * Function 4: Analyze Visual
   * For the Image Dropzone.
   */
  async analyzeVisual(file: File): Promise<string> {
    try {
      const base64Data = await fileToGenerativePart(file);

      const prompt = `
        Analyze this image for the archive.
        Task: Describe location, technology, and hidden details.
        Tone: Cinematic, sci-fi, and analytical. Keep it under 50 words.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            },
            { text: prompt }
          ]
        }
      });

      return response.text || "Visual analysis complete.";

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
