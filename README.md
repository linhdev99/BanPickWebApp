# Ban-Pick WebApp

## Mô tả

Webapp hỗ trợ ban-pick theo cấu hình JSON. Cho phép cấu hình số lượt ban/pick cho từng team theo từng round.

## Cấu hình (`config.json`)

```json
{
    "banRounds": {
        "1": {
            "firstTeam": "Blue",
            "countPerTeam": 3
        },
        "2": {
            "firstTeam": "Red",
            "countPerTeam": 2
        }
    },
    "pickRounds": {
        "1": [
            { "team": "Blue", "count": 1 },
            { "team": "Red",  "count": 2 },
            { "team": "Blue", "count": 2 },
            { "team": "Red",  "count": 1 }
        ],
        "2": [
            { "team": "Red",  "count": 1 },
            { "team": "Blue", "count": 2 },
            { "team": "Red",  "count": 1 }
        ]
    }
}
```

## Tính năng

- Đọc cấu hình ban/pick từ file JSON.
- Hiển thị giao diện ban-pick theo từng round.
- Hỗ trợ chọn team bắt đầu, số lượt ban/pick mỗi team.

## Khởi tạo dự án

```bash
npx create-react-app ban-pick-webapp
cd ban-pick-webapp
```

## Cấu trúc đề xuất

```
src/
    ├── components/
    │     ├── BanPhase.js
    │     ├── PickPhase.js
    ├── config.json
    ├── App.js
```

## Ý tưởng triển khai

- Đọc file `config.json` để lấy thông tin các round ban/pick.
- Tạo các component cho từng phase (BanPhase, PickPhase).
- Hiển thị lượt ban/pick theo đúng thứ tự và số lượng đã cấu hình.

## Giao diện mẫu

- Hiển thị các lượt ban/pick, team nào đang thực hiện, số lượt còn lại.
- Cho phép chọn đối tượng để ban/pick (tùy theo game).

---

> **Gợi ý:** Có thể mở rộng thêm tính năng lưu lại lịch sử ban/pick, reset, hoặc export kết quả.
