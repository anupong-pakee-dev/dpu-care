# DPUCARE — ไฟล์ UI ใหม่ (ครบทุกหน้า)

## ไฟล์ทั้งหมด

| ไฟล์ในแพ็ก | วางที่ | แบบ |
|---|---|---|
| `src/App.jsx` | `client/src/App.jsx` | ทับ |
| `src/AppNew.css` | `client/src/AppNew.css` | ใหม่ |
| `src/Languages.json` | `client/src/Languages.json` | ทับ |
| `src/components/user/Authentication.jsx` | `client/src/components/user/Authentication.jsx` | ทับ |
| `src/components/user/AuthNew.css` | `client/src/components/user/AuthNew.css` | ใหม่ |
| `src/components/admin/Admin.jsx` | `client/src/components/admin/Admin.jsx` | ทับ |
| `src/components/admin/AdminNew.css` | `client/src/components/admin/AdminNew.css` | ใหม่ |

โครงโฟลเดอร์ในแพ็กตรงกับ `client/` อยู่แล้ว — ลากทับได้ทั้งก้อน

## สิ่งที่ไม่ต้องแตะ

- `App.css` เดิม — เก็บไว้ได้ ตอนนี้ไม่มีไฟล์ไหนเรียกใช้แล้ว จะลบก็ได้ถ้ามั่นใจ
- `main.jsx`, `index.css`, `Router.jsx` ไม่ต้องแก้ (แต่ละ component import CSS ของตัวเอง)
- `api/api.js`, `Themes.json`, `ThemesData.json`, `Toast.jsx`, `hooks/`, `utils/` ไม่เปลี่ยน

## ตรวจว่ารันได้

```bash
cd client
npm run dev
```

---

## หน้าแอปหลัก (App.jsx)

- แถบเมนูซ้ายถาวร: โลโก้ → “เริ่มแชทใหม่” → สลับโหมด → ประวัติการแชท → เพลง → ตั้งค่า/ภาษา → บัญชี
- เอาบล็อกเวลา/วันที่ออก
- มือถือ: แถบเมนูเดียวกันเปิดเป็น drawer จาก ☰ (เดิมแยกเมนูกับประวัติเป็น 2 ชั้น)
- สลับโหมดเป็นปุ่ม segmented พร้อมคำอธิบายว่าต่างกันยังไง (เดิมเป็น `<select>`)
- คำเตือนโหมดระบายเป็นแถบในหน้า ไม่ใช่ modal บังจอ
- ตั้งค่าเป็นหน้าต่างซ้อน มีพรีวิวธีมแบบกริด ติ๊กถูกที่ธีมที่ใช้อยู่

## หน้าเข้าสู่ระบบ (Authentication.jsx)

- แท็บ “เข้าสู่ระบบ / สมัครสมาชิก” แทนลูกศร ← → ที่ไม่บอกว่าไปไหน
- ทุกช่องมี label ข้างบน ไม่ใช่มีแค่ placeholder
- ปุ่มส่งรหัสยืนยันเขียนว่า “ส่งรหัส” พร้อมตัวนับถอยหลัง (เดิมเป็นไอคอนเครื่องบินเปล่า)
- ลืมรหัสผ่านเป็นหน้าย่อยมีปุ่มย้อนกลับ
- รูปพื้นหลังเต็มจอ + ไล่เฉดทับ ให้การ์ดอ่านง่ายทุกขนาดจอ
- ปุ่มสลับภาษามุมขวาบน

## หน้า Admin (Admin.jsx)

- แบ่งเป็น 4 หน้า: ภาพรวม / รายงาน / Prompt template / ทดสอบแชท — แทนกริดที่ยัดทุกอย่างไว้จอเดียว
- ตัวเลขสรุปเป็นการ์ด มีป้ายกำกับชัด (เดิมเป็นเลขลอยในกล่อง)
- รายงานเป็นตารางมีสถานะเป็น chip กดดูรายละเอียดเปิดเป็นหน้าต่างซ้อน
- Prompt template: รายการ session ซ้าย + เอดิเตอร์ขวา เลือกเวอร์ชันจาก dropdown มีปุ่ม “ใช้งาน” ที่บอกชัดว่ากำลังผูกกับโหมดไหน
- ทดสอบแชทใช้ layout เดียวกับหน้าผู้ใช้จริง

---

## สิ่งที่แก้เชิงเทคนิค

- เลิกแก้ `element.style` ผ่าน `getElementById` ทั้งหมด (เดิมมีใน `showOnOffChatHistory`, `navMenuFull`, `fullSelect`) → ใช้ React state
- เลิกใช้ `scrollIntoView` เปลี่ยนเป็น `scrollTo` บน container
- ปิด drawer / modal ด้วยปุ่ม Esc
- แก้บั๊ก `handleUpdateTemplate` เดิมส่ง `template.template` แต่ textarea เก็บเป็น string ตรง ๆ ทำให้บันทึกไม่ติด → ใช้ `handleChangeTemplate` แล้ว
- รองรับ `prefers-reduced-motion`, `:focus-visible`, `env(safe-area-inset-*)`

## ตรรกะที่เหมือนเดิมทุกอย่าง

API ทุกตัว, localStorage ทุก key, ระบบโทเคน, limit ผู้ใช้ที่ยังไม่ล็อกอิน, Google login, ยืนยันอีเมล, ธีม 6 แบบ, เพลง 6 แทร็ก, อินโทร 4 ข้อความ, TH/EN

## ข้อความใหม่ใน Languages.json

เพิ่ม: `send` `done` `endchat` `deletechat` `fullscreen` `replayintro` `selectmodesub` `hintadvice` `hintventing` `themesub` `languagesub` `audiosub` `sendcode` `or` `trylimited` `forgotpasssub` และ `warnsendmail` ฝั่ง th (เดิมมีแต่ en) — ของเดิมอยู่ครบไม่ได้ลบอะไร
