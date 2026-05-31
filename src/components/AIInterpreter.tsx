import React from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Brain, Key, AlertTriangle, Eye, EyeOff, FileText, CheckCircle, RefreshCw } from "lucide-react";

interface AIInterpreterProps {
  interpretation: string | null;
  isLoading: boolean;
  error: string | null;
  onTriggerInterpret: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  modelSelection: "gemini-3.5-flash" | "gemini-3.1-pro-preview";
  setModelSelection: (model: "gemini-3.5-flash" | "gemini-3.1-pro-preview") => void;
}

export const AIInterpreter: React.FC<AIInterpreterProps> = ({
  interpretation,
  isLoading,
  error,
  onTriggerInterpret,
  apiKey,
  setApiKey,
  modelSelection,
  setModelSelection,
}) => {
  const [showKey, setShowKey] = React.useState<boolean>(false);
  const [saveStatus, setSaveStatus] = React.useState<boolean>(false);

  // Save key to browser local storage for convenience
  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("tuvi_byok_key", apiKey.trim());
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleSaveKeyInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    localStorage.setItem("tuvi_byok_key", apiKey.trim());
    setSaveStatus(true);
    setTimeout(() => {
      setSaveStatus(false);
      onTriggerInterpret();
    }, 500);
  };

  const handleClearKey = () => {
    localStorage.removeItem("tuvi_byok_key");
    setApiKey("");
  };

  const isQuotaError = !!(
    error && (
      error.includes("Hệ thống nhận thấy số lượng yêu cầu") ||
      error.includes("Quota") ||
      error.includes("Rate Limit") ||
      error.includes("RESOURCE_EXHAUSTED") ||
      error.toLowerCase().includes("limit")
    )
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-250 dark:border-neutral-800 shadow-xl overflow-hidden">
      {/* Configuration Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-950/80">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              BÌNH GIẢI LÁ SỐ BẰNG TRÍ TUỆ NHÂN TẠO AI
            </h3>
            <span className="text-[10px] bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full font-black tracking-wider uppercase animate-pulse shadow-md">
              Chế độ Nói Thật & Trực Diện ⚡
            </span>
          </div>
          <p className="text-xs text-indigo-200 mt-1">
            Ứng dụng thuật toán phân tích sát sườn cả mặt hỷ cát lẫn mặt tai họa, hãm địa, sát tinh hiểm ác để đương số can đảm nhìn nhận thực tế và chủ động khắc chế vận số.
          </p>
        </div>

        {/* Bring-Your-Own-Key Input form inside header */}
        <form onSubmit={handleSaveKey} className="flex gap-2 items-center bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-700/50 w-full md:w-auto">
          <Key className="w-4 h-4 text-indigo-300 ml-1.5 shrink-0" />
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              placeholder="Nhập API Key cá nhân (BYOK)..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="text-xs bg-indigo-950 border border-indigo-800 focus:border-indigo-600 focus:outline-none rounded p-1 px-2 text-white w-48 placeholder-indigo-400/60"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition-colors uppercase shrink-0"
          >
            {saveStatus ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : "Lưu"}
          </button>
          {apiKey && (
            <button
              type="button"
              onClick={handleClearKey}
              className="text-[10px] text-rose-400 hover:text-rose-300 px-1 font-semibold"
            >
              Xóa
            </button>
          )}
        </form>
      </div>

      <div className="p-6 space-y-6">
        {/* Model and execution configuration line */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-50 dark:bg-neutral-950 p-4 rounded-xl border border-stone-200 dark:border-neutral-800">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">Cấu hình Bộ Não Luận Giải</span>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-neutral-300">
                <input
                  type="radio"
                  name="model_select"
                  checked={modelSelection === "gemini-3.5-flash"}
                  onChange={() => setModelSelection("gemini-3.5-flash")}
                  className="accent-indigo-600"
                />
                <span className="flex items-center gap-1">
                  Gemini 3.5 Flash
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-1 rounded">Nhanh/Tối ưu</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-neutral-300">
                <input
                  type="radio"
                  name="model_select"
                  checked={modelSelection === "gemini-3.1-pro-preview"}
                  onChange={() => setModelSelection("gemini-3.1-pro-preview")}
                  className="accent-indigo-600"
                />
                <span className="flex items-center gap-1">
                  Gemini 3.1 Pro (Bình tinh tế)
                  <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1 rounded">Mạt sắc sâu</span>
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={onTriggerInterpret}
            disabled={isLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold p-3 px-6 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/20 active:scale-98 transition-all shrink-0 text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang luận giải lá số cổ học...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Khởi động AI Luận Giải Tử Vi
              </>
            )}
          </button>
        </div>

        {/* Informative warning if using fallback/placeholder key */}
        {!apiKey && (
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/15 rounded-lg border border-amber-150 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-tight">
              - <strong>Bắt buộc dùng API Key cá nhân (BYOK):</strong> Để bảo mật dữ liệu và phân luồng xử lý mượt mà riêng biệt, ứng dụng không tích hợp khoá sẵn của nhà phát triển. Quý vị vui lòng điền khoá API Gemini cá nhân hành chính chủ của mình ở thanh cấu hình phía trên trước khi bắt đầu. <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="underline font-bold hover:text-amber-600 dark:hover:text-amber-400">Lấy khoá API miễn phí trong 1 phút tại Google AI Studio ↗</a>.
            </p>
          </div>
        )}

        {/* Loading placeholder or Empty presentation or Result display */}
        {isLoading ? (
          <div className="p-12 text-center text-stone-500 space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <span className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-amber-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="font-extrabold text-stone-900 dark:text-white text-base">Đang Kết Nối Bát Tự Tam Hợp...</p>
              <p className="text-xs text-stone-400">
                AI đang tính toán mệnh thế, phối hợp sao chiếu, xung âm dương ngũ hành cát hung để biên soạn...
              </p>
            </div>
          </div>
        ) : error ? (
          isQuotaError ? (
            <div className="p-6 rounded-xl bg-amber-50/70 border border-amber-200 dark:bg-amber-950/15 dark:border-amber-900/40 text-stone-900 dark:text-neutral-100 space-y-5 animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-stone-900 dark:text-amber-400 text-sm tracking-tight">
                    YÊU CẦU ĐANG QUÁ TẢI (RATE LIMIT / QUOTA EXHAUSTED)
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-neutral-350 mt-1 leading-relaxed">
                    Hệ thống nhận thấy số lượng yêu cầu của quý vị hoặc máy chủ đang vượt quá hạn mức sử dụng tạm thời của Google Gemini API. Quý vị có thể xử lý lập tức bằng 2 phương án bên dưới:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Wait & Retry */}
                <div className="p-4 rounded-lg bg-white/90 dark:bg-neutral-900 border border-amber-100 dark:border-neutral-800 space-y-2 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Phương án 1 (Phụ thuộc chung)
                    </span>
                    <h5 className="font-bold text-xs text-stone-800 dark:text-neutral-200 mt-2">
                      Đợi 30 giây rồi gửi lại mong đợi hàng chờ trống
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-neutral-400 leading-relaxed mt-1">
                      Hạn mức dùng thử miễn phí chung của máy chủ được tự động làm mới liên tục theo từng phút. Quý vị hãy kiên nhẫn một chút rồi nhấn nút gửi lại.
                    </p>
                  </div>
                  <button
                    onClick={onTriggerInterpret}
                    className="w-full mt-3 bg-amber-600 hover:bg-amber-500 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Thử gửi lại ngay lập tức
                  </button>
                </div>

                {/* Option 2: Personal Key (BYOK) */}
                <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/40 space-y-2 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Phương án 2 (Độc lập/Tối ưu)
                    </span>
                    <h5 className="font-bold text-xs text-indigo-900 dark:text-indigo-300 mt-2">
                      Sử dụng API Key Gemini cá nhân miễn phí
                    </h5>
                    <p className="text-[11px] text-stone-600 dark:text-neutral-400 leading-relaxed mt-1">
                      Khi tự điền khoá riêng, bạn được Google cấp luồng xử lý độc lập hoàn toàn miễn phí, nhanh hơn và không bao giờ lo bị quá tải chung.
                    </p>
                    <div className="mt-1">
                      <a
                        href="https://aistudio.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-650 dark:text-indigo-400 hover:underline hover:text-indigo-850"
                      >
                        Lấy khóa Gemini miễn phí tại Google AI Studio ↗
                      </a>
                    </div>
                  </div>

                  {/* Built-in inline API Key input for maximum ease */}
                  <div className="mt-3 pt-2 border-t border-indigo-100/50 dark:border-indigo-950/30">
                    <form onSubmit={handleSaveKeyInline} className="flex gap-1.5 items-center">
                      <div className="relative flex-1">
                        <input
                          type={showKey ? "text" : "password"}
                          placeholder="Dán API Key của bạn vào đây..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="text-xs bg-white dark:bg-neutral-900 border border-indigo-250 dark:border-indigo-900 text-stone-900 dark:text-white rounded px-2.5 py-1.5 w-full pr-7 placeholder-stone-400 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        >
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={!apiKey.trim()}
                        className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-3 py-1.5 rounded transition-all shrink-0 shadow-sm"
                      >
                        {saveStatus ? "Đã lưu!" : "Lưu & Xem"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Quá trình luận giải gặp lỗi:</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )
        ) : interpretation ? (
          <div className="border border-stone-200 dark:border-neutral-800 rounded-xl p-6 bg-stone-50/50 dark:bg-stone-950/20 max-h-[700px] overflow-y-auto font-sans leading-relaxed text-stone-850 dark:text-neutral-200">
            <div className="flex justify-between items-center pb-3 mb-6 border-b border-stone-200 dark:border-neutral-800">
              <h4 className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5 text-sm">
                <FileText className="w-4 h-4 text-indigo-650" />
                HỘ KIỆT BÌNH TOÀN CHI TIẾT LÁ SỐ
              </h4>
              <button
                onClick={() => window.print()}
                className="text-xs text-indigo-650 font-semibold border border-indigo-200 hover:bg-stone-100 p-1 px-3 rounded dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                In sớ mệnh (PDF)
              </button>
            </div>

            {/* Custom Markdown Renderer for PDF ready reports */}
            <div className="markdown-body prose prose-stone dark:prose-invert max-w-none text-xs sm:text-sm space-y-6">
              <ReactMarkdown>{interpretation}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-xl text-center border-2 border-dashed border-stone-200 dark:border-neutral-800 text-stone-400 space-y-3">
            <div className="inline-flex p-3 bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 rounded-full">
              <Brain className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <p className="font-bold text-stone-800 dark:text-neutral-200 text-sm">Chưa có bản luận giải nào được tạo</p>
              <p className="text-xs">
                Ấn nút <strong>"Khởi động AI Luận Giải Tử Vi"</strong> để AI phân tích tam hợp lục hại, an sao, và đúc kết chi tiết mệnh vận cuộc đời quý vị.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
