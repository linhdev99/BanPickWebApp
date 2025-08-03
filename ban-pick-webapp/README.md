# Ban-Pick WebApp

🎮 **Webapp hỗ trợ ban-pick theo cấu hình JSON được xây dựng bằng React**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/linhdev99/BanPickWebApp)
[![React](https://img.shields.io/badge/React-18.0+-61dafb)](https://reactjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://www.javascript.com/)

## 🚀 Demo

Webapp hỗ trợ system ban-pick linh hoạt với khả năng cấu hình theo JSON, phù hợp cho các game tournament, esports competitions.

## ✨ Tính năng chính

- 🔄 **Alternating Ban-Pick System**: Ban → Pick → Ban → Pick theo từng round
- 🛡️ **Item Protection**: Items đã pick không thể bị ban lại
- 👥 **Team Visibility**: Hiển thị rõ team nào đã pick item nào
- 📱 **Responsive UI**: Giao diện hiện đại, tối ưu cho 100 items
- ⚙️ **JSON Configuration**: Dễ dàng tùy chỉnh quy tắc ban/pick
- 🎨 **Visual Feedback**: Color coding, hover effects, progress indicators

## 🏗️ Cấu trúc dự án

```
BanPickWebApp/
├── ban-pick-webapp/           # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── BanPhase.js    # Component xử lý ban phase
│   │   │   └── PickPhase.js   # Component xử lý pick phase
│   │   ├── config.json        # Cấu hình ban/pick rules
│   │   ├── App.js            # Component chính
│   │   ├── App.css           # Styles chính
│   │   └── index.js          # Entry point
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies
│   └── PROJECT_README.md     # Detailed documentation
├── .gitignore               # Git ignore rules
└── README.md               # This file
```

## ⚙️ Cấu hình (config.json)

### Ban Rounds

```json
{
  "banRounds": {
    "1": {
      "firstTeam": "Blue", // Team bắt đầu ban đầu
      "countPerTeam": 3 // Số lượt ban mỗi team trong round này
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
      { "team": "Blue", "count": 1 }, // Blue team pick 1 lượt
      { "team": "Red", "count": 2 }, // Red team pick 2 lượt
      { "team": "Blue", "count": 2 }, // Blue team pick 2 lượt
      { "team": "Red", "count": 1 } // Red team pick 1 lượt
    ],
    "2": [
      { "team": "Red", "count": 1 },
      { "team": "Blue", "count": 2 },
      { "team": "Red", "count": 1 }
    ]
  }
}
```

## 🎮 Luồng hoạt động

### **Alternating Ban-Pick System**

1. **Round 1**: Ban Phase (Blue 3, Red 3) → Pick Phase (Blue 1→Red 2→Blue 2→Red 1)
2. **Round 2**: Ban Phase (Red 2, Blue 2) → Pick Phase (Red 1→Blue 2→Red 1)
3. **Hoàn thành**: Hiển thị kết quả cuối cùng

### **Quy tắc bảo vệ Items**

- ❌ **Ban Phase**: Không thể ban items đã pick (protected)
- ❌ **Pick Phase**: Không thể pick items đã ban hoặc đã pick
- ✅ **Visual Indicators**: Color coding cho từng trạng thái

## 🚀 Cách chạy dự án

### **Prerequisites**

- Node.js 14+
- npm hoặc yarn

### **Installation & Running**

```bash
# Clone repository
git clone https://github.com/linhdev99/BanPickWebApp.git
cd BanPickWebApp

# Navigate to React app
cd ban-pick-webapp

# Cài đặt dependencies
npm install

# Chạy development server
npm start
# App sẽ chạy tại http://localhost:3000

# Build cho production
npm run build
```

## 🎨 Item States & UI

### **Item Pool**

- **100 items** (Item 1 → Item 100)
- **Responsive grid** với scroll support
- **Mobile optimized**

### **Visual States**

```
🟢 Available    → Có thể ban/pick (nền trắng + border xám)
🔴 Banned       → Đã bị ban (nền đỏ đậm + text trắng)
🔵 Picked Blue  → Đã pick bởi Blue (nền xanh dương + text trắng)
🔴 Picked Red   → Đã pick bởi Red (nền đỏ + text trắng)
```

## 🛠️ Tùy chỉnh

### **Thay đổi Items**

1. Edit `mockItems` array trong `BanPhase.js` và `PickPhase.js`
2. Hoặc tạo data file riêng và import

### **Thay đổi Rules**

Edit `src/config.json` theo format đã mô tả

### **Thay đổi UI/UX**

Edit `src/App.css` để tùy chỉnh colors, layout, animations

## 🏆 Tính năng kỹ thuật

- **State Management**: Global state cho banned/picked items qua rounds
- **Performance**: Optimized rendering cho 100 items grid
- **Accessibility**: Keyboard navigation, screen reader support
- **Responsive**: Mobile-first design approach

## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🔮 Roadmap & Extensions

### **Immediate Improvements**

- [ ] Save/Load configuration
- [ ] Export results (JSON/CSV/PDF)
- [ ] Undo/Redo functionality
- [ ] Timer countdown

### **Advanced Features**

- [ ] Multiplayer support (real-time)
- [ ] Tournament bracket system
- [ ] Sound effects & animations
- [ ] Dark/Light theme

### **Integration Options**

- [ ] API integration với game databases
- [ ] Stream overlay support (OBS)
- [ ] Discord bot integration
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact & Support

- **GitHub**: [@linhdev99](https://github.com/linhdev99)
- **Repository**: [BanPickWebApp](https://github.com/linhdev99/BanPickWebApp)

---

⭐ **Star this repo if you find it helpful!** ⭐
