# Patch: เพิ่มฟิลด์งวดในฟอร์ม "เพิ่มกรมธรรม์" — admin.html

## วิธีใช้
เปิดไฟล์ `admin.html` แล้วหาตำแหน่งแต่ละข้อและแก้ไขตามนี้

---

## CHANGE 1 — เพิ่ม `onchange` ให้ pol-paymentType

**หา:**
```html
<select class="modal-input" id="pol-paymentType" style="font-family:inherit">
  <option value="">-- เลือก --</option>
  <option>ผ่อน</option><option>จ่ายเต็ม</option>
</select>
```

**แทนด้วย:**
```html
<select class="modal-input" id="pol-paymentType" style="font-family:inherit"
  onchange="toggleInstallmentSection()">
  <option value="">-- เลือก --</option>
  <option>ผ่อน</option><option>จ่ายเต็ม</option>
</select>
```

---

## CHANGE 2 — เพิ่ม installment section หลัง closing `</div></div>` ของ paymentType+status grid

**หา** (บรรทัดปิด grid ของ paymentType+status):
```html
        </div>
      </div>
      <label class="modal-label">ตัวแทนที่ดูแล</label>
```

**แทนด้วย:**
```html
        </div>
      </div>

      <!-- ── ส่วนงวดผ่อนชำระ (แสดงเมื่อเลือก "ผ่อน") ── -->
      <div id="pol-installment-section" style="display:none;background:#fff8f0;border:1.5px solid #ffe0b2;border-radius:10px;padding:14px;margin-top:4px">
        <div style="font-size:11px;font-weight:700;color:var(--orange);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">📋 ตั้งค่างวดผ่อนชำระ</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label class="modal-label">จำนวนงวด <span style="color:var(--red)">*</span></label>
            <input class="modal-input" id="pol-installmentCount" type="number"
              placeholder="เช่น 12" min="1" max="120"
              oninput="calcInstallmentAmount()">
          </div>
          <div>
            <label class="modal-label">ยอดต่องวด (บาท)</label>
            <input class="modal-input" id="pol-installmentAmount" type="number"
              placeholder="คำนวณอัตโนมัติ" min="0">
          </div>
        </div>
        <div style="margin-top:10px">
          <label class="modal-label">วันครบกำหนดงวดแรก <span style="color:var(--red)">*</span></label>
          <input class="modal-input" id="pol-firstDueDate" type="date">
        </div>
        <div id="pol-installment-preview" style="font-size:11px;color:#666;margin-top:8px;padding:6px 10px;background:#fff3e0;border-radius:6px;display:none"></div>
      </div>

      <label class="modal-label">ตัวแทนที่ดูแล</label>
```

---

## CHANGE 3 — เพิ่มฟังก์ชัน JS ก่อน `confirmAddPolicy()`

**หา:**
```javascript
async function confirmAddPolicy() {
```

หรือถ้ายังไม่มีฟังก์ชันนั้น ให้หาบรรทัด `function loadPolicies` แล้วเพิ่มก่อนหน้า

**เพิ่มก่อนหน้า:**
```javascript
function toggleInstallmentSection() {
  const pt  = document.getElementById('pol-paymentType').value;
  const sec = document.getElementById('pol-installment-section');
  sec.style.display = pt === 'ผ่อน' ? '' : 'none';
  if (pt === 'ผ่อน') calcInstallmentAmount();
}

function calcInstallmentAmount() {
  const net   = Number(document.getElementById('pol-netPremium').value || 0);
  const count = Number(document.getElementById('pol-installmentCount').value || 0);
  const amtEl = document.getElementById('pol-installmentAmount');
  const prev  = document.getElementById('pol-installment-preview');
  if (net > 0 && count > 0 && !amtEl.value) {
    const auto = Math.round(net / count);
    amtEl.placeholder = fmt(auto) + ' (อัตโนมัติ)';
  }
  if (count > 0) {
    const amt = Number(amtEl.value) || (net > 0 && count > 0 ? Math.round(net / count) : 0);
    prev.style.display = '';
    prev.textContent = `📋 ${count} งวด × ฿${fmt(amt)} = ฿${fmt(amt * count)}`;
  } else {
    prev.style.display = 'none';
  }
}
```

---

## CHANGE 4 — แก้ `confirmAddPolicy()` เพิ่ม installment fields

ใน `confirmAddPolicy()` ให้เพิ่ม fields เหล่านี้ในตัวแปร `data` ที่ส่งไป GAS:

```javascript
// เพิ่มก่อนบรรทัด const data = encodeURIComponent(...)
const paymentType      = document.getElementById('pol-paymentType').value;
const installmentCount = Number(document.getElementById('pol-installmentCount').value || 0);
const installmentAmountRaw = Number(document.getElementById('pol-installmentAmount').value || 0);
const netPremium       = Number(document.getElementById('pol-netPremium').value || 0);
const installmentAmount = installmentAmountRaw || (installmentCount > 0 ? Math.round(netPremium / installmentCount) : 0);
const firstDueDate     = document.getElementById('pol-firstDueDate').value; // yyyy-MM-dd

// Validate ผ่อน
if (paymentType === 'ผ่อน') {
  if (!installmentCount || installmentCount < 1) { showToast('กรุณาระบุจำนวนงวด'); return; }
  if (!firstDueDate) { showToast('กรุณาระบุวันครบกำหนดงวดแรก'); return; }
}
```

และใน object ที่ส่งใส่ `data`:
```javascript
// เพิ่ม fields เหล่านี้:
installmentCount,
installmentAmount,
firstDueDate,
```

---

## ตัวอย่าง confirmAddPolicy() สมบูรณ์ (ถ้าไม่มีอยู่แล้ว)

```javascript
async function confirmAddPolicy() {
  const policyNumber   = document.getElementById('pol-policyNumber').value.trim();
  const customerName   = document.getElementById('pol-customerName').value.trim();
  const paymentType    = document.getElementById('pol-paymentType').value;
  const netPremium     = Number(document.getElementById('pol-netPremium').value || 0);
  const installmentCount = Number(document.getElementById('pol-installmentCount').value || 0);
  const installmentAmountRaw = Number(document.getElementById('pol-installmentAmount').value || 0);
  const installmentAmount = installmentAmountRaw || (installmentCount > 0 ? Math.round(netPremium / installmentCount) : 0);
  const firstDueDate   = document.getElementById('pol-firstDueDate').value;

  if (!policyNumber) { showToast('กรุณากรอกเลขกรมธรรม์'); return; }
  if (!customerName) { showToast('กรุณากรอกชื่อลูกค้า'); return; }
  if (paymentType === 'ผ่อน' && !installmentCount) { showToast('กรุณาระบุจำนวนงวด'); return; }
  if (paymentType === 'ผ่อน' && !firstDueDate) { showToast('กรุณาระบุวันครบกำหนดงวดแรก'); return; }

  const payload = {
    policyNumber,
    customerName,
    agentId:       document.getElementById('pol-agentId').value,
    licensePlate:  document.getElementById('pol-licensePlate').value,
    policyType:    document.getElementById('pol-policyType').value,
    hasCompulsory: document.getElementById('pol-hasCompulsory').value,
    startDate:     document.getElementById('pol-startDate').value,
    expiryDate:    document.getElementById('pol-expiryDate').value,
    paymentType,
    status:        document.getElementById('pol-status').value,
    address:       document.getElementById('pol-address').value,
    customerPhone: document.getElementById('pol-customerPhone').value,
    vehicleCode:   document.getElementById('pol-vehicleCode').value,
    vehicleYear:   document.getElementById('pol-vehicleYear').value,
    vehicleBrand:  document.getElementById('pol-vehicleBrand').value,
    vehicleModel:  document.getElementById('pol-vehicleModel').value,
    netPremium,
    grossPremium:  Number(document.getElementById('pol-grossPremium').value || 0),
    premium:       Number(document.getElementById('pol-premium').value || 0),
    insurer:       document.getElementById('pol-insurer').value,
    insurerPhone:  document.getElementById('pol-insurerPhone').value,
    garageType:    document.getElementById('pol-garageType').value,
    roadsideAvail: document.getElementById('pol-roadsideAvail').value,
    roadsidePhone: document.getElementById('pol-roadsidePhone').value,
    roadsideCond:  document.getElementById('pol-roadsideCond').value,
    // ── installment ──
    installmentCount,
    installmentAmount,
    firstDueDate,
  };

  document.getElementById('pol-submit-btn').disabled = true;
  const data = encodeURIComponent(JSON.stringify(payload));
  const res  = await apiGet('addPolicy', { data });
  document.getElementById('pol-submit-btn').disabled = false;

  if (res?.success) {
    showToast('✅ ' + res.message);
    closeModal('modal-policy');
    loadPolicies();
    if (payload.paymentType === 'ผ่อน' && res.installments) loadInstallments();
  } else {
    showToast('❌ ' + (res?.message || 'เกิดข้อผิดพลาด'));
  }
}
```

---

## GAS Backend — เสร็จแล้ว ✅
`addPolicyAdmin()` ใน Code_complete.js ถูก update แล้ว รองรับ:
- `installmentCount` — จำนวนงวด
- `installmentAmount` — ยอดต่องวด (ถ้าว่างใช้ netPremium ÷ count)
- `firstDueDate` — วันครบกำหนดงวดแรก (รูปแบบ yyyy-MM-dd หรือ dd/MM/yyyy)
- สร้างงวดใน ผ่อนชำระ sheet อัตโนมัติ ทุกงวดห่างกัน 1 เดือน
