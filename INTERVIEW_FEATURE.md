# 🎤 Tính năng Phỏng Vấn AI - Standalone Version

## Giới thiệu
Tính năng "Phỏng Vấn tôi" cho phép người dùng trò chuyện trực tiếp với chatbot được lập trình với thông tin cá nhân, kinh nghiệm làm việc và kỹ năng của Phát. Chatbot sẽ trả lời như chính Phát trong một buổi phỏng vấn thực tế.

## 🚀 Standalone Solution

### ✅ Ưu điểm
- **Không cần API key**: Hoạt động hoàn toàn độc lập
- **Không có chi phí**: Không cần thanh toán cho OpenAI API
- **Tức thì**: Phản hồi ngay lập tức, không cần chờ API
- **Đáng tin cậy**: Không bị lỗi network hoặc quota exceeded
- **Bảo mật**: Không gửi dữ liệu ra ngoài

### 🎯 Smart Responses
Chatbot được lập trình với các câu trả lời thông minh dựa trên keywords:

## Cách sử dụng

### 1. Không cần cấu hình
- Không cần API key
- Không cần environment variables
- Chạy ngay sau khi clone

### 2. Chạy ứng dụng
```bash
# Development
npm start

# Production build
npm run build:prod
```

### 3. Sử dụng tính năng
1. Truy cập website
2. Nhấn vào nút **"Phỏng vấn tôi"** (màu xanh lá) ở góc dưới bên phải
3. Bắt đầu trò chuyện với chatbot

## 🎭 Câu hỏi được hỗ trợ

### **"giới thiệu", "bản thân"**
→ Giới thiệu tổng quan về Phát

### **"kinh nghiệm", "làm việc"**  
→ Lịch sử công việc và các công ty đã làm

### **"kỹ năng", "công nghệ"**
→ Tech stack và kỹ năng chuyên môn

### **"angular"**
→ Chuyên môn về Angular framework

### **"dự án", "project"**
→ Các dự án đã tham gia

### **"backbase"**
→ Thông tin về công ty hiện tại

### **Câu hỏi khác**
→ Câu trả lời chung và gợi ý hỏi thêm

## Ví dụ câu hỏi

### Giới thiệu bản thân
- "Bạn có thể giới thiệu về bản thân không?"
- "Kể cho tôi nghe về background của bạn"

### Kinh nghiệm làm việc
- "Bạn đã làm việc ở những công ty nào?"
- "Dự án nào bạn tự hào nhất?"
- "Bạn có kinh nghiệm gì với Angular?"

### Kỹ năng chuyên môn
- "Bạn sử dụng những công nghệ nào?"
- "Bạn có kinh nghiệm với React không?"
- "Bạn làm việc theo phương pháp Agile như thế nào?"

## Tính năng

### ✨ Highlights
- **🤖 Smart Chatbot**: Trả lời thông minh dựa trên keywords
- **⚡ Instant Response**: Phản hồi tức thì, không delay
- **🎯 Context Aware**: Hiểu ngữ cảnh và trả lời phù hợp
- **🖼️ Avatar Integration**: Hiển thị avatar thật trong chat
- **📱 Responsive**: Giao diện đẹp trên mọi thiết bị

### 🎯 Công nghệ sử dụng
- **Angular 19**: Frontend framework
- **TypeScript**: Type-safe programming
- **Ant Design**: UI components
- **RxJS**: Reactive programming
- **Pure JavaScript**: Logic xử lý chatbot

## Deployment

### Vercel (Khuyến nghị)
```bash
# Deploy trực tiếp, không cần cấu hình gì
vercel --prod
```

### Netlify
```bash
# Build và deploy
npm run build:prod
# Upload thư mục dist/
```

### GitHub Pages
```bash
# Build và push
npm run build:prod
git add dist/
git commit -m "Deploy"
git push
```

## Kiến trúc

```
[User Input] → [Keyword Detection] → [Smart Response] → [Display]
     ↓              ↓                    ↓              ↓
"Kinh nghiệm" → Contains "kinh nghiệm" → Work history → Chat bubble
```

### Luồng hoạt động:
1. **User** gửi câu hỏi
2. **System** phân tích keywords trong câu hỏi
3. **Logic** chọn response phù hợp nhất
4. **UI** hiển thị câu trả lời với avatar

## File Structure

```
src/
├── app/
│   ├── components/
│   │   ├── interview-button/     # Floating button
│   │   └── interview-chat/       # Chat interface
│   └── services/
│       └── interview.service.ts  # Chatbot logic
```

## Customization

### Thêm câu trả lời mới
Chỉnh sửa trong `src/app/services/interview.service.ts`:

```typescript
private getDemoResponse(messages: any[]): string {
  const userMessage = lastMessage?.content?.toLowerCase() || '';
  
  // Thêm keyword detection mới
  if (userMessage.includes('react')) {
    return 'Tôi có kinh nghiệm với React...';
  }
  
  // Existing logic...
}
```

### Thay đổi avatar
Thay thế file `src/assets/images/avatar.jpeg`

### Customize UI
Chỉnh sửa CSS trong các component tương ứng

## Troubleshooting

### Chat không hoạt động
- Kiểm tra console browser có lỗi không
- Đảm bảo avatar image tồn tại

### Câu trả lời không phù hợp
- Thêm keywords mới vào `getDemoResponse()`
- Cải thiện logic phân tích câu hỏi

### UI bị lỗi
- Kiểm tra Ant Design components
- Verify CSS không bị conflict

## Performance

### Ưu điểm về hiệu suất:
- **Không có network calls**: Phản hồi tức thì
- **Lightweight**: Không cần load external libraries
- **Fast loading**: Chỉ load khi cần thiết
- **Mobile optimized**: Responsive design

## Future Enhancements

### Có thể mở rộng:
- **More keywords**: Thêm nhiều từ khóa hơn
- **Context memory**: Nhớ ngữ cảnh cuộc trò chuyện
- **Rich responses**: Thêm links, images vào câu trả lời
- **Multi-language**: Hỗ trợ tiếng Anh

---

**💡 Tip**: Tính năng này hoạt động hoàn hảo mà không cần bất kỳ cấu hình nào. Chỉ cần clone và chạy!
