const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export interface GeneratedTrail {
  title: string;
  durationLabel: string;
  summary: string;
  trailDate?: string;
  stops: {
    time: string;
    title: string;
    location: string;
    activity: string;
    icon: string;
  }[];
}

export const generateAiTrail = async (
  city: string,
  interests: string[],
  duration: string,
  dateFormatted: string,
  userPrompt?: string
): Promise<GeneratedTrail> => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Missing Gemini API Key. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file."
    );
  }

  const prompt = `You are a heritage travel expert curating an artisan crafts trail. 
City: ${city}
Interests: ${interests.join(", ")}
Duration: ${duration}
Date: ${dateFormatted}
${userPrompt ? `User's Special Request: ${userPrompt}\nMake sure to tailor the itinerary to accommodate this special request if possible.` : ""}

Generate a realistic and highly curated heritage trail itinerary based on these parameters. 
Return the output EXACTLY as a valid JSON object following this schema. Do not include markdown code blocks (like \`\`\`json), just the raw JSON object.

{
  "title": "A short catchy title for the trail",
  "durationLabel": "The duration formatted nicely (e.g. 'Full Day', 'Half Day')",
  "summary": "A 1-2 sentence compelling summary of what the user will experience.",
  "stops": [
    {
      "time": "e.g., 09:30 AM",
      "title": "Name of the stop/activity",
      "location": "A realistic location/neighborhood name in the city",
      "activity": "1 short sentence describing the hands-on activity",
      "icon": "A valid MaterialCommunityIcons name (e.g., 'cup-water', 'palette-outline', 'silverware-fork-knife', 'certificate-outline', 'map-marker', 'camera')"
    }
  ]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error("Failed to generate trail from Gemini API");
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error("Invalid response format from Gemini");
    }

    // Parse the JSON (Gemini might sometimes still wrap it in ```json despite instructions, so we clean it)
    const cleanedText = textOutput.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    const parsedData = JSON.parse(cleanedText) as GeneratedTrail;
    
    // Add the date manually since Gemini doesn't always include it in the schema response
    return {
      ...parsedData,
      trailDate: dateFormatted,
    };
  } catch (error) {
    console.error("Gemini trail generation failed:", error);
    throw error;
  }
};
