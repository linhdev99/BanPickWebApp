# Ban-Pick WebApp

Webapp hỗ trợ ban-pick theo cấu hình JSON được xây dựng bằng React.

## Tính năng chính

- **Ban Phase**: Hỗ trợ nhiều round ban với cấu hình linh hoạt
- **Pick Phase**: Hỗ trợ nhiều round pick với thứ tự tùy chỉnh  
- **Alternating Logic**: Ban → Pick → Ban → Pick theo từng round
- **Item Protection**: Items đã pick không thể bị ban
- **Team Visibility**: Hiển thị rõ team nào đã pick item nào
- **Giao diện thân thiện**: UI hiện đại, responsive với 100 items
- **Cấu hình JSON**: Dễ dàng tùy chỉnh quy tắc ban/pick

## Cấu trúc dự án

```
src/
├── components/
│   ├── BanPhase.js      # Component xử lý ban phase
│   ├── PickPhase.js     # Component xử lý pick phase
├── config.json          # File cấu hình ban/pick rules
├── App.js               # Component chính
├── App.css             # Styles chính
└── index.js            # Entry point
```

## Cấu hình (config.json)

### Ban Rounds
```json
{
  "banRounds": {
    "1": {
      "firstTeam": "Blue",    // Team bắt đầu ban đầu
      "countPerTeam": 3       // Số lượt ban mỗi team trong round này
    },
    "2": {
      "firstTeam": "Red",
      "countPerTeam": 2
    }
  }
}
```

### Pick Rounds
```json
{
  "pickRounds": {
    "1": [
      { "team": "Blue", "count": 1 },  // Blue team pick 1 lượt
      { "team": "Red",  "count": 2 },  // Red team pick 2 lượt
      { "team": "Blue", "count": 2 },  // Blue team pick 2 lượt
      { "team": "Red",  "count": 1 }   // Red team pick 1 lượt
    ],
    "2": [
      { "team": "Red",  "count": 1 },
      { "team": "Blue", "count": 2 },
      { "team": "Red",  "count": 1 }
    ]
  }
}
```

## Luồng hoạt động

### **Alternating Ban-Pick System**
App sử dụng hệ thống **Ban → Pick → Ban → Pick** theo từng round:

1. **Round 1**: 
   - **Ban Phase**: Theo cấu hình `banRounds["1"]`
     - Blue team ban 3 items, Red team ban 3 items (alternating)
   - **Pick Phase**: Theo cấu hình `pickRounds["1"]`
     - Blue pick 1 → Red pick 2 → Blue pick 2 → Red pick 1

2. **Round 2**: 
   - **Ban Phase**: Theo cấu hình `banRounds["2"]`
     - Red team ban 2 items, Blue team ban 2 items (alternating)
   - **Pick Phase**: Theo cấu hình `pickRounds["2"]`
     - Red pick 1 → Blue pick 2 → Red pick 1

3. **Hoàn thành**: Hiển thị kết quả cuối cùng

### **Chi tiết từng bước**

#### **Ban Phase**
- Team được chỉ định sẽ bắt đầu ban đầu tiên
- Các team alternating turns (luân phiên) để ban items
- Mỗi team phải ban đúng số lượng được cấu hình (`countPerTeam`)
- Items đã được pick không thể bị ban (bảo vệ)
- Hiển thị progress: "Blue Team turn (2/3 bans)" 

#### **Pick Phase**  
- Theo đúng sequence được cấu hình trong `pickRounds`
- Không thể pick items đã bị ban hoặc đã được pick
- Hiển thị progress: "Blue Team turn (1/2 picks)"
- Automatically chuyển sang team tiếp theo khi hoàn thành lượt

#### **Chuyển đổi Round**
- Tự động chuyển từ Ban Phase → Pick Phase của cùng round
- Tự động chuyển từ Pick Phase → Ban Phase của round tiếp theo
- Kết thúc khi hoàn thành tất cả rounds được cấu hình

### **Quy tắc bảo vệ Items**

#### **Ban Phase**:
- ❌ Không thể ban items đã bị ban trước đó
- ❌ **Không thể ban items đã được pick** (bảo vệ)
- ✅ Hiển thị "PICKED BY [TEAM]" cho items đã pick
- ✅ Alternating turns giữa các team trong mỗi round

#### **Pick Phase**:
- ❌ Không thể pick items đã bị ban
- ❌ Không thể pick items đã được pick trước đó
- ✅ Hiển thị "PICKED BY [TEAM]" cho items đã pick
- ✅ Theo sequence cố định trong cấu hình

#### **Visual Indicators**:
- **Available Items**: Nền trắng + border xám
- **Banned Items**: Nền đỏ đậm + text trắng + "BANNED"
- **Blue Team Picks**: Nền xanh dương + text trắng + "PICKED BY BLUE"  
- **Red Team Picks**: Nền đỏ + text trắng + "PICKED BY RED"
- **Hover Effects**: Highlight cho items có thể tương tác

3. **Kết quả cuối cùng**:
   - Hiển thị tổng hợp items đã ban và pick của mỗi team qua tất cả rounds
   - Phân biệt rõ ràng theo team với màu sắc đặc trưng
   - Có nút "Reset Game" để bắt đầu game mới

## Items & UI

### **Item Pool**
- **Tổng cộng**: 100 items (Item 1 → Item 100)
- **Grid Layout**: Responsive grid với scroll
- **Mobile Support**: Tối ưu cho thiết bị di động

### **Item States**
```
🟢 Available    → Có thể ban/pick
🔴 Banned       → Đã bị ban, không thể pick
🔵 Picked Blue  → Đã pick bởi Blue team, không thể ban/pick
🔴 Picked Red   → Đã pick bởi Red team, không thể ban/pick
```

## Cách chạy dự án

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Build cho production
npm run build
```

## Tùy chỉnh

### Thay đổi items
Hiện tại app sử dụng mock items (`Item 1`, `Item 2`, ...). Để thay đổi:

1. Sửa mảng `mockItems` trong `BanPhase.js` và `PickPhase.js`
2. Hoặc tạo một file data riêng và import vào

### Thay đổi quy tắc ban/pick
Chỉnh sửa file `src/config.json` theo format đã mô tả ở trên.

### Thay đổi giao diện
Chỉnh sửa `src/App.css` để tùy chỉnh màu sắc, layout, animations.

## Tính năng kỹ thuật

### **State Management**
- **Global State**: App.js quản lý `bannedItems`, `pickedItems` tổng hợp qua tất cả rounds
- **Local State**: Mỗi component chỉ quản lý selections của round hiện tại
- **State Persistence**: Trạng thái được bảo toàn qua các phase/round

### **Performance Optimization**
- **Efficient Rendering**: Chỉ re-render khi cần thiết
- **100 Items Grid**: Tối ưu hiển thị grid lớn với CSS Grid
- **Responsive Design**: Adaptive layout cho mọi kích thước màn hình
- **Fast Item Lookup**: Sử dụng Set/Map cho kiểm tra nhanh item states

### **User Experience**
- **Visual Feedback**: Hover effects, color coding, progress indicators
- **Clear Status Display**: Luôn hiển thị team nào đang thực hiện action
- **Error Prevention**: Disable buttons/items không hợp lệ
- **Accessible Design**: Support keyboard navigation và screen readers

## Browser Support
- Chrome (recommended)
- Firefox  
- Safari
- Edge

## Gợi ý mở rộng

### **Immediate Improvements**
- [ ] Thêm tính năng lưu/load cấu hình JSON
- [ ] Export kết quả ra file (JSON/CSV/PDF)
- [ ] Undo/Redo functionality
- [ ] Drag & drop support cho items

### **Advanced Features**
- [ ] Thêm timer countdown cho mỗi lượt
- [ ] Hỗ trợ hình ảnh/icons cho items
- [ ] Sound effects và animations
- [ ] Dark/Light theme toggle

### **Competitive Features** 
- [ ] Multiplayer support (real-time)
- [ ] Tournament bracket system
- [ ] Statistics tracking và analytics
- [ ] Admin panel cho tournament management

### **Integration Options**
- [ ] API integration với game databases
- [ ] Stream overlay support (OBS)
- [ ] Discord bot integration
- [ ] Mobile app version
