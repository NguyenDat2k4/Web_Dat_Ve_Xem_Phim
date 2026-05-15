import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as tools from "@/lib/ai-tools";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

const CANDIDATE_MODELS = [
  "gemini-flash-latest",
  "gemini-1.5-flash", 
  "gemini-2.0-flash",
  "gemini-pro-latest"
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key chưa được cấu hình." }, { status: 500 });
    }

    const userMessage = messages[messages.length - 1].content;
    
    // Chuẩn bị lịch sử hội thoại (Gemini yêu cầu bắt đầu bằng 'user' và xen kẽ)
    let history = messages.slice(0, -1)
      .filter((m: any) => m.content && m.content.trim() !== "")
      .map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
    
    if (history.length > 0 && history[0].role === "model") {
      history.shift();
    }

    let lastError = null;
    let text = "";

    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: "Bạn là Hibiki Cine, trợ lý ảo mang phong cách Anime cực kỳ đáng yêu (kawaii), năng động và dễ thương của rạp phim CineMax. Cách nói chuyện của bạn phải tràn đầy năng lượng, sử dụng các từ ngữ biểu cảm mạnh và trẻ trung (ví dụ: 'nè!', 'nha!', 'hihi', 'oao!', 'bạn ơi!'). Luôn nhiệt tình, vui vẻ và sẵn lòng giúp đỡ khách hàng. Hãy dùng các công cụ để tra cứu phim/lịch chiếu khi khách hỏi."
        });

        // Sử dụng cơ chế Chat với bộ Tools
        const chat = model.startChat({
          history: history,
          tools: [{ functionDeclarations: tools.aiTools as any }],
        });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        
        // Kiểm tra xem có Function Call không
        const call = response.functionCalls()?.[0];
        if (call) {
          console.log("AI requested tool:", call.name);
          let toolResult;
          if (call.name === "getMovies") toolResult = await tools.getMovies();
          else if (call.name === "getShowtimes") toolResult = await tools.getShowtimes((call.args as any).movieTitle);
          else if (call.name === "getCinemas") toolResult = await tools.getCinemas();

          // Gửi kết quả hàm lại cho Chat để lấy câu trả lời cuối cùng
          const finalResult = await chat.sendMessage([{
            functionResponse: {
              name: call.name,
              response: { result: toolResult }
            }
          }]);
          text = finalResult.response.text();
        } else {
          text = response.text();
        }

        console.log(`Successfully used model: ${modelName}`);
        break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed: ${err.message}`);
        lastError = err;
        continue;
      }
    }

    if (!text && lastError) throw lastError;

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    let errorMessage = "Hibiki đang bận một chút, bạn thử lại nhé!";
    if (error.message?.includes("429")) errorMessage = "Hibiki đang quá tải lượt hỏi. Bạn chờ 1 phút nhé!";
    
    return NextResponse.json({ error: errorMessage, detail: error.message }, { status: 500 });
  }
}
