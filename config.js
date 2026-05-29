// ============================================================
//  ISARA INTER BROKER — Config ส่วนกลาง
//  แก้ที่ไฟล์นี้ไฟล์เดียว ทุกหน้าจะใช้ค่านี้อัตโนมัติ
// ============================================================

window.ISARA_CONFIG = {

  // ── Google Apps Script Web App URL ──────────────────────────
  // ได้จาก: GAS → Deploy → Manage deployments → Web app URL
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzte-NzPR1_NuGkxUC2bajoT2Un3k15FMT1HT-f8fo-6uNBwrheAlfRf0-MrNwOiPmNrg/exec',

  // ── Cloudflare Worker URL ────────────────────────────────────
  // ใช้รับ POST จาก agent.html (bypass GAS 302 redirect)
  WORKER_URL: 'https://isara-reminder.nattp-isr.workers.dev',

  // ── LINE LIFF ID ──────────────────────────────────────────────
  // ได้จาก: LINE Developers Console → LIFF → LIFF ID
  LIFF_ID: '2010186323-8y5GORz2',

};
