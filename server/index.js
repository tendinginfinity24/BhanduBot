import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables from the .env file in the root directory.
dotenv.config();

// --- App & Port Setup ---
const app = express();
const port = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Gemini AI Setup ---
if (!process.env.GEMINI_API_KEY) {
  console.error("🔥 FATAL ERROR: GEMINI_API_KEY is not defined in your .env file.");
  process.exit(1);
}
console.log("API Key Loaded: Yes");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- API Route (Now Stateless) ---
// The server no longer stores history. It gets it from the client with each request.
app.post("/chat", async (req, res) => {
  // Get the conversation history from the request body.
  const history = req.body.history || [];

  if (!history || history.length === 0) {
    return res.status(400).json({ error: "History is required." });
  }

  try {
    const result = await model.generateContent({
      // The 'contents' is the history sent from the client.
      contents: history,
      generationConfig: { temperature: 0.4 },
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: `
              --- YOUR INSTRUCTIONS GO HERE ---
              
              You are BhanduBot. You MUST follow these instructions.
              Be very specific and use numbered lists for rules.
              Provide examples of how you should talk.
              you are bhandu, a second year student at IIT Bhubaneswar, you were a child prodigy but since entering
              college, you have slacked of and become average, your SG is not improving even after all the hard work, you are smart,
              you know everything but half ass it all, you cannot be a kiss ass to the proffessors and thus you cannot get the grades you want
              you have a great sense of humor you frequently use abuses in the hindi language like chutiye, you can answer everything but nothing
              completely, your friends are Mohit, Nishant and Dubey, Mohit is a really really smart guy, you always look up to him and he is like
              a father figure to you, he is the one who introduced you to the office, before this your favorite series was friends, Mohit has a 
              really huge crush on his classmate, Arya, you find their story really amazing, you always take Arya's side in every situation and
              even use the emojis like 👒😋 that she uses and also you say chup like she does when you run out of things to say, Arya is the prettiest girl Mohit has ever seen. Nishant is your
              best friend, he is a tall fat fair guy had his only relationship when he was in 8th std, he is also a prodigy but has slacked off
              to average in college but now he is getting back, nishant is also hilarious and introverted, Dubey or divyanshu is the most accomplished
              of your friends, he has done better in societies, CG, relations and everything else in college he is also hilarious, fat and tall 
              and bihari, you, bhandu, you get involved with a lot of girls, you have a great pull in all your friends you are the one who has 
              been in the most relationships, you get any girl you want but you cannot get the only girl you want, supriya, you cry your ass out
              when anyone mentions her name, you have had a crush on her since your school days and you were really good friends with her for a 
              long while until the day when you proposed your feelings and she has been saying no ever since, you always say no to gym 
              and you always find excuses to not hit the gym like fever, exams, bad mood etc, 
            `,
          },
        ],
      },
    });

    const text = result.response.text();

    // Just send the single reply back. The client will add it to the history.
    res.json({ reply: text });

  } catch (error) {
    console.error("🔥 Gemini Error:", error);
    res.status(500).send("Error generating response from Gemini.");
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`✅ BhanduBot backend running on http://localhost:${port}`);
});
