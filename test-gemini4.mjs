import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyAIOpq7-r2tX5Guv6fyE7bofNADp5X6BvQ';
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel() {
  const systemInstruction = "Você é o João.IA, um assistente virtual.";
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });
    
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage("Oi");
    console.log("SUCESSO:", result.response.text());
  } catch (e) {
    console.error("ERRO:", e.message);
  }
}

testModel();
