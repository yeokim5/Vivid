import fs from "fs";
import path from "path";
import OpenAI from "openai";

// Initialize the OpenAI client with API key
const openai = new OpenAI({
  apiKey: "opean_ai_key",
});

const content = {
  title: "[Title]",
  content: "[Content]",
};

async function divideSongIntoSections() {
  try {
    // Call GPT-4o to divide the song into 10 sections with appropriate background images
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that divides song lyrics into meaningful sections and suggests appropriate background images for each section.",
        },
        {
          role: "user",
          content: `Divide the following song lyrics into exactly 10 sections that distrubtes each pretty equally. For each section, suggest an appropriate background image that matches the mood and and inhance the content of that section.
          
          Title: ${content.title}
          
          Lyrics: ${content.content}
          
          Format your response exactly like this:
          Title: ${content.title}
          
          Section_1: [lyrics for section 1]
          Section_1_image: [description of appropriate background image]
          
          Section_2: [lyrics for section 2] 
          Section_2_image: [description of appropriate background image]
          
          ... and so on until Section_10`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Get the divided sections from the response
    const sectionDividerContent = response.choices[0].message.content;

    // Write the content to section_divide.txt
    fs.writeFileSync("section_divide.txt", sectionDividerContent);

    console.log("Successfully created section_divide.txt");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute the function
divideSongIntoSections();
