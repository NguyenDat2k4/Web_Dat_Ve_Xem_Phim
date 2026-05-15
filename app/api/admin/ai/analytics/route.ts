import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as adminTools from "@/lib/admin-ai-tools";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key chưa được cấu hình." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: "Bạn là chuyên gia phân tích dữ liệu kinh doanh của hệ thống rạp phim CineMax. Nhiệm vụ của bạn là phân tích các con số doanh thu, doanh số và đưa ra nhận xét, dự báo thông minh. Hãy trả lời bằng Tiếng Việt, sử dụng các số liệu cụ thể để chứng minh."
    });

    const userMessage = messages[messages.length - 1].content;
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: history,
      tools: [{ functionDeclarations: adminTools.adminAiTools as any }],
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    const call = response.functionCalls()?.[0];
    if (call) {
      let toolResult;
      if (call.name === "getRevenueData") toolResult = await adminTools.getRevenueData();
      else if (call.name === "getOccupancyStats") toolResult = await adminTools.getOccupancyStats();

      const finalResult = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: { result: toolResult }
        }
      }]);
      
      // Trả về cả text phân tích và dữ liệu thô để Dashboard vẽ biểu đồ
      return NextResponse.json({ 
        content: finalResult.response.text(),
        rawData: toolResult // Gửi kèm dữ liệu thô để vẽ biểu đồ
      });
    }

    return NextResponse.json({ content: response.text() });
  } catch (error: any) {
    console.error("Admin AI Analytics Error:", error);
    return NextResponse.json({ error: "Lỗi phân tích dữ liệu." }, { status: 500 });
  }
}
