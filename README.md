# HedBoon AI (เฮ็ดบุญ)

ผู้ช่วยอัจฉริยะด้านประเพณีและพิธีกรรมอีสาน — ช่วยวางแผนจัดงานบุญ ไม่ใช่แค่รวมข้อมูล

## ฟีเจอร์หลัก

1. **Ceremony Planner** — เลือกพิธี + จำนวนแขก ได้ checklist, ปริมาณของใช้, กำหนดการ
2. **Knowledge Graph** — แผนภาพเชื่อมโยงของใช้ / พิธี / ความเชื่อ / ข้อห้าม
3. **ฮีต 12 Timeline** — เรียนรู้บุญรายเดือน
4. **ถาม AI** — ChatGPT เป็นหลัก, Gemini สำรอง, มีโหมดความรู้ในเครื่องเมื่อไม่มี API

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env
npm run dev
```

เปิด [http://localhost:5173](http://localhost:5173)

### API Keys (ไม่บังคับ)

ในไฟล์ `.env`:

```env
VITE_OPENAI_API_KEY=sk-...
VITE_GEMINI_API_KEY=...
```

ถ้าไม่มี key ระบบยังถาม-ตอบจากคลังความรู้ JSON ได้ (โหมด offline)

> หมายเหตุ: การใส่ API key ใน `VITE_*` จะถูกฝังฝั่งเบราว์เซอร์ เหมาะกับเดโมโครงงาน สำหรับใช้งานจริงควรย้ายไปเรียกผ่านเซิร์ฟเวอร์

## สแต็ก

- Vite + React + TypeScript
- Tailwind CSS v4
- React Router
- React Flow (Knowledge Graph)

## โครงสร้างข้อมูล

- `src/data/ceremonies/` — พิธีขึ้นบ้านใหม่, งานบวช
- `src/data/items.json` — ของใช้ในพิธี
- `src/data/heet12.json` — ฮีต 12
- `src/data/graph.json` — โหนด/เส้นของ Knowledge Graph
- `src/data/formulas.json` — สูตรคำนวณตามจำนวนแขก
