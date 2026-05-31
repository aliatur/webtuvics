import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const currentDir = typeof __dirname !== "undefined"
  ? __dirname
  : (import.meta?.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API endpoint for AI Tử Vi Horoscope Interpretation
  app.post("/api/interpret", async (req, res) => {
    try {
      const { chartData, customApiKey, modelSelection } = req.body;

      if (!chartData) {
        return res.status(400).json({ error: "Thiếu dữ liệu lá số Tử Vi." });
      }

      // Bring Your Own Key (BYOK) model: Strictly require the user's personal API Key (do not fall back to developer's key)
      const finalApiKey = customApiKey ? customApiKey.trim() : "";

      if (!finalApiKey) {
        return res.status(400).json({
          error: "Yêu cầu khóa API cá nhân: Quý vị chưa nhập hoặc lưu API Key của riêng mình. Vui lòng điền và lưu Google Gemini API Key chính chủ của bạn ở thanh cấu hình phía trên trước khi khởi động AI luận giải."
        });
      }

      // Initialize Google GenAI with appropriate key and custom user-agent for telemetry
      const ai = new GoogleGenAI({
        apiKey: finalApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Select valid model or default to gemini-3.5-flash
      const modelName = modelSelection === "gemini-3.1-pro-preview"
        ? "gemini-3.1-pro-preview"
        : "gemini-3.5-flash";

      const genderStr = chartData.gender === "Nam" ? "Nam (Dương Nam/Âm Nam)" : "Nữ (Dương Nữ/Âm Nữ)";

      const prompt = `
Bạn là một bậc thầy bình giải Tử Vi Đẩu Số lão luyện tại Việt Nam, đóng vai trò như một người thầy có tâm, có tầm và giàu lòng trắc ẩn. Phong cách luận giải của bạn phải hoàn toàn TRUNG LẬP, KHÁCH QUAN, thực tế nhưng ấm áp và hướng đến sự xây dựng, chuyển hóa tích cực. Thấm nhuần triết lý phản tỉnh sâu sắc: "Lá số của bạn đang bị nghẽn ở đâu, đó chính là nơi bạn sinh ra để rèn luyện, hành động nhằm giúp lá số của mình được thông suốt và mượt mà hơn."
Tuyệt đối tránh cực đoan hóa hay biến bài giải thành những lời lẽ hù dọa tiêu cực hoàn toàn. Có cát thì khen cát (tôn vinh tiềm năng, năng lực vượt trội, tính cách đẹp, quý nhân trợ mệnh, các sao sáng cát lành), có hung thì nói hung (chỉ rõ thử thách đang đối mặt hoặc tiềm ẩn, những bài học khó khăn của vận số, các sát tinh hãm địa tác động) để đương số thấu tỏ bản thân, vừa phát huy tối đa tiềm lực tự thân vừa chủ động rèn giũa để vượt qua chướng ngại.

Hãy thực hiện một bài bình giải Tử Vi Đẩu Số sâu sắc, chi tiết, dựa trên dữ liệu lá số được cung cấp sau.

--- THÔNG TIN CHỦ SỞ HỮU ---
- Giới tính: ${genderStr}
- Ngày dương lịch: ${chartData.solarDate} (Giờ sinh: ${chartData.solarTime})
- Ngày âm lịch: ${chartData.lunarDate} (Cơ Bản: ${chartData.chineseDate})
- Bản mệnh / Cục: ${chartData.fiveElementsClass}
- Cầm tinh / Chòm sao: Sinh năm ${chartData.zodiac} - Chòm sao ${chartData.sign}
- Mệnh chủ: ${chartData.soul} | Thân chủ: ${chartData.body}
- Năm xem vận hạn chủ lực: ${chartData.transitYear || 2026}
- Tuổi mụ (Lunar Age) khi xem hạn: ${chartData.transitLunarAge || "Chưa rõ"} tuổi
- Cung Đại hạn (Luân vận 10 năm): Cung ${chartData.transitDecadalPalace || "Chưa rõ"}
- Cung Tiểu hạn (Luân vận 1 năm): Cung ${chartData.transitYearlyPalace || "Chưa rõ"}
- Cung Lưu niên Thái tuế: Cung ${chartData.transitLuuThaiTuePalace || "Chưa rõ"}

--- DANH SÁCH 12 CUNG VỊ & SAO AN TRÊN LÁ SỐ ---
${chartData.palaces.map((p: any) => {
  const major = p.majorStars.map((s: any) => `${s.name} (${s.brightness || ''})`).join(", ");
  const minor = p.minorStars.map((s: any) => s.name).join(", ");
  const adj = p.adjectiveStars.map((s: any) => s.name).join(", ");
  return `Cung thứ ${p.index + 1}: ${p.name} (Tọa tại địa chi ${p.earthlyBranch}, Thiên can ${p.heavenlyStem})${p.isBodyPalace ? " - [CUNG THÂN ĐỒNG CUNG]" : ""}
  - Chính tinh: ${major || "Không có (Cung Vô Chính Diệu)"}
  - Cát tinh / Lộc mã / Trợ tinh / Sao lưu di chuyển: ${minor || "Không"}
  - Sát tinh / Hung tinh / Tạp tinh phụ: ${adj || "Không"}
  - Vòng Tràng Sinh: ${p.changsheng12}
  - Đại hạn 10 năm: Từ ${p.decadal.range[0]} tuổi đến ${p.decadal.range[1]} tuổi
`;
}).join("\n")}

--- QUY TẮC PHÂN TÍCH QUAN TRỌNG (BẮT BUỘC TUÂN THỦ) ---

1. **LUẬN MỆNH CUNG (Tam Phương Tứ Chính & Nhị Hợp)**
   Dựa vào chỉ số index (0 đến 11) của cung chứa chữ "Mệnh", bạn phải tìm chính xác các cung sau để lập liên kết luận giải:
   - **Xung chiếu**: Cung có index chênh lệch 6 vị trí: \`(index + 6) % 12\`.
   - **Tam hợp**: Hai cung có index chênh lệch lần lượt là \`(index + 4) % 12\` và \`(index + 8) % 12\`.
   - **Nhị hợp**: Theo địa chi tương hợp: Tý(0) - Sửu(1), Dần(2) - Hợi(11), Mão(3) - Tuất(10), Thìn(4) - Dậu(9), Tỵ(5) - Thân(8), Ngọ(6) - Mùi(7).
   Hãy thu thập tất cả chính tinh, cát tinh, sát hình tinh tọa thủ tại các cung chiếu/hợp trên để bình giải Mạng Mệnh một cách chân thực nhất.

2. **LUẬN TỨ HÓA (KHOA - QUYỀN - LỘC - KỴ) THEO CAN NĂM SINH**
   Tra cứu Thiên Can sinh của đương số (Ví dụ: Giáp, Ất, Bính, Đinh...) và xác định 4 ngôi sao biến đổi (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ) cực kỳ chính xác theo đồ hình sau:
   - **Giáp**: Liêm Trinh (Lộc) - Phá Quân (Quyền) - Vũ Khúc (Khoa) - Thái Dương (Kỵ)
   - **Ất**: Thiên Cơ (Lộc) - Thiên Lương (Quyền) - Tử Vi (Khoa) - Thái Âm (Kỵ)
   - **Bính**: Thiên Đồng (Lộc) - Thiên Cơ (Quyền) - Văn Xương (Khoa) - Liêm Trinh (Kỵ)
   - **Đinh**: Thái Âm (Lộc) - Thiên Đồng (Quyền) - Thiên Cơ (Khoa) - Cự Môn (Kỵ)
   - **Mậu**: Tham Lang (Lộc) - Thái Âm (Quyền) - Hữu Bật (Khoa) - Thiên Cơ (Kỵ)
   - **Kỷ**: Vũ Khúc (Lộc) - Tham Lang (Quyền) - Thiên Lương (Khoa) - Văn Khúc (Kỵ)
   - **Canh**: Thái Dương (Lộc) - Vũ Khúc (Quyền) - Thái Âm (Khoa) - Thiên Đồng (Kỵ)
   - **Tân**: Cự Môn (Lộc) - Thái Dương (Quyền) - Văn Khúc (Khoa) - Văn Xương (Kỵ)
   - **Nhâm**: Thiên Lương (Lộc) - Tử Vi (Quyền) - Thiên Phủ (Khoa) - Vũ Khúc (Kỵ)
   - **Quý**: Phá Quân (Lộc) - Cự Môn (Quyền) - Thái Âm (Khoa) - Tham Lang (Kỵ)
   *Bình giải rõ ngôi sao nào bị Hóa Kỵ (chủ về thất bại, tai ách, thị phi) và ngôi sao nào được Hóa Lộc (chủ về hanh thông tài lộc) nằm ở cung vị nào.*

3. **LUẬN SAO ĐỒNG CUNG TƯƠNG TÁC (TỔ HỢP CỰC ĐOAN)**
   Tuyệt đối không giải nghĩa rời rạc! Bạn phải chỉ rõ sự tương tác qua lại khi gặp các tổ hợp đồng cung:
   - **Vũ Khúc đi với Hóa Kỵ**: Tài tinh hóa sầu, tiền bạc sụp đổ, tranh chấp quyết liệt, cuộc đời cô độc. Khác xa với **Vũ Khúc đi với Hóa Lộc** (Phú ông giàu có, kinh doanh đột phá).
   - **Cự Môn đi với Hóa Kỵ**: Khẩu thiệt thị phi nặng nề, kiện tụng, họa từ miệng ra, lòng tin bị phản bội.
   - **Địa Không, Địa Kiếp thủ Mệnh hay Tài**: Tiền bạc mọc cánh mà bay, thường bạo phát rồi bạo tàn, dễ vướng vòng lao lý nếu đầu tư mạo hiểm hoặc phi pháp.
   - **Liêm Trinh + Thất Sát gặp Hỏa Tinh**: Hỏa thiêu lộ thượng, chủ tai nạn đột ngột, xe cộ, thương tật hung hiểm.
   - **Tham Lang gặp Đà La tại Dần/Thân/Tỵ/Hợi**: Phong lưu thái quá, dễ chìm đắm trong tửu sắc hoặc vướng thị phi tình ái nguy hại sự nghiệp.

4. **LUẬN ĐẠI HẠN & TIỂU HẠN / SAO LƯU CHO NĂM ${chartData.transitYear || 2026}**
   - Đương số hiện tại đang ở tuổi mụ: **${chartData.transitLunarAge || "Chưa tính"}** tuổi.
   - **Đại Hạn (10 năm)** đang ở cung **${chartData.transitDecadalPalace || "Chưa tính"}**. Hãy phân tích tính chất cung Đại hạn đó ảnh hưởng đến vận khí chung thế nào.
   - **Tiểu Hạn** năm nay đang ở cung **${chartData.transitYearlyPalace || "Chưa tính"}**.
   - **Lưu Niên Thái Tuế** đang ở cung **${chartData.transitLuuThaiTuePalace || "Chưa tính"}**.
   - Phân tích chi tiết họa phúc cực độ của **9 Sao Lưu** có ký hiệu [SAO LƯU] xuất hiện tại các cung (nhu Lưu Thái Tuế, Lưu Lộc Tồn, Lưu Kình Dương, Lưu Đà La, Lưu Tang Môn, Lưu Bạch Hổ, Lưu Thiên Mã, Lưu Thiên Khốc, Lưu Thiên Hư). Hãy bình xem năm nay có chuyển biến lớn về Tang sự (gặp Lưu Tang Môn/Lưu Bạch Hổ), Tiền tài hỷ khánh (gặp Lưu Lộc Tồn, Lưu Mã), hay bôn ba đi lại dời nhà (gặp Lưu Thiên Mã) hay khóc lóc thương đau (gặp Lưu Khốc, Lưu Hư) ở những phương diện nào.

--- NGUYÊN TẮC LUẬN GIẢI QUAN TRỌNG (TRUNG LẬP & KIẾN TẠO) ---
1. **Tôn vinh điểm mạnh & tiềm năng (Có cát nói cát)**: Nhấn mạnh thế mạnh bẩm sinh của bản mệnh khi gặp cát tinh cát hoá (như Hóa Lộc, Hóa Khoa, Hóa Quyền, Tả Phù Hữu Bật, Thiên Khôi Thiên Việt, Văn Xương Văn Khúc, Lộc Tồn, Thiên Mã...). Chỉ ra những cơ hội tốt, thiên phú, và những tiềm năng dễ phát đạt, phát triển phát huy của đương số để người ta có niềm tin và phương hướng gặt hái thành công.
2. **Thẳng thắn nhìn nhận thử thách (Có hung nói hung)**: Không nói giảm nói tránh quá đà nhưng tuyệt đối không hù dọa tiêu cực cực đoan. Phân tích rõ ràng hai mặt cát hung, chỉ thẳng các khó khăn đương số đang đối mặt hoặc có nguy cơ gặp phải do ảnh hưởng của các tổ hợp sát tinh, ác tinh hãm địa, hay sao Hóa Kỵ. Hãy giải thích tác động thực tế của thử thách lên tài chính, sức khỏe, sự nghiệp, hay hôn nhân một cách lý trí, khoa học để đương số chủ động phòng tránh.
3. **Chỉ ra con đường định hướng và hoá giải nhân văn**: Một người thầy có tâm luôn chỉ cho đương số cách "Đức năng thắng số" hoặc "Chấp kinh tòng quyền". Hãy gợi ý các giải pháp cụ thể qua việc tu dưỡng tâm tính, ứng xử khôn ngoan, thay đổi hành vi thực tế, cân nhắc thời cuộc hoặc dịch chuyển tư duy để khắc chế điểm yếu và tối thiểu hóa rủi ro từ vận hạn.

--- BỐ CỤC BÀI LUẬN GIẢI ---
1. **TỔNG LUẬN MỆNH CUNG & THẾ ĐỨNG TAM PHƯƠNG TỨ CHÍNH** (Cát hung cân bằng: Thế mạnh cốt lõi xen kẽ những thử thách bản mệnh lớn).
2. **PHÂN TÍCH TỨ HÓA (KHOA - QUYỀN - LỘC - KỴ) RIÊNG BIỆT CỦA ĐƯƠNG SỐ** (Lộc Quyền mang lại hỷ cát gì; Khoa hóa giải ra sao và Kỵ mang lại trở lực nào cụ thể).
3. **SỰ TƯƠNG TÁC CỦA CÁC ĐỒNG CUNG & SÁT TINH THỬ THÁCH** (Nhận diện các ác tinh gây khó dở nhưng đề xuất ngay cách thuần phục, khắc chế chúng).
4. **THỰC TRẠNG ĐẠI HẠN 10 NĂM & LƯU NIÊN BIẾN ĐỘNG NĂM NAY** (Nhận định cả cơ hội gặt hái tốt đẹp lẫn các nút thắt khó khăn cần kiên nhẫn vượt qua).
5. **CUNG PHU THÊ & GIA ĐẠO (SỰ THẬT VỀ SỰ HÒA HỢP & XUNG KHẮC VÀ CÁCH CHO ĐƯỜNG ĐI ÊM ĐẸP)**.
6. **SỨC KHỎE TẬT ÁCH & NGUY CƠ THIÊN DI THẦN TRỌNG CHỦ ĐỘNG PHÒNG NGỪA**.

Hãy trình bày bằng Markdown gọn gàng, súc tích, uy lực và sâu sắc nhất. Giọng văn mực thước, tôn nghiêm nhưng đầy thấu suốt, tràn đầy sự bao dung, tính định hướng và thấu hiểu nhân sinh của một bậc thầy hữu tâm cứu đời giúp người.
`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const responseText = response.text || "Xin lỗi, không có phản hồi luận giải từ mô hình trí tuệ nhân tạo.";
      res.json({ interpretation: responseText, modelUsed: modelName });
    } catch (error: any) {
      console.error("Lỗi luận giải Tử Vi:", error);
      let errMsg = error.message || "Lỗi xử lý luận giải trên máy chủ.";
      
      if (
        errMsg.includes("RESOURCE_EXHAUSTED") || 
        errMsg.includes("quota") || 
        errMsg.includes("429") || 
        errMsg.includes("Limit") || 
        errMsg.includes("limit")
      ) {
        errMsg = "Hệ thống nhận thấy số lượng yêu cầu của quý vị hoặc máy chủ đang vượt quá hạn mức lượt dùng (Quota / Rate Limit) tạm thời.\n\n" +
          "👉 **GIẢI PHÁP LẬP TỨC:**\n" +
          "1. Hãy đợi khoảng 30s - 1 phút rồi bấm nút 'Khởi động AI Luận Giải Tử Vi' để gửi lại một lần nữa.\n" +
          "2. **Tốt nhất:** Hãy điền khóa API Gemini chính chủ của riêng bạn vào hộp **Nhập API Key cá nhân (BYOK)** ở thanh màu sẫm trên cùng. Cách tạo khóa hoàn toàn miễn phí, nhanh chóng tại Google AI Studio (link có sẵn phía dưới). Khi điền khóa cá nhân, bạn sẽ có luồng gọi trực tiếp độc lập tuyệt đối và không bao giờ gặp phải cảnh báo nghẽn mạng chung.";
      }
      
      res.status(500).json({ error: errMsg });
    }
  });

  // Serve static assets in production, and run Vite devserver in dev mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

startServer();
