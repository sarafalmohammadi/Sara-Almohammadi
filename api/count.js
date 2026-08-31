/* عدّاد فتحات البطاقة — Vercel Serverless Function
 * التخزين: Upstash Redis (REST) عبر متغيرات البيئة التي يضيفها تكامل Vercel تلقائيًا.
 * بدون تخزين مهيّأ ترجع الدالة configured:false وتبقى الصفحة تعمل بدون عدّاد.
 */
const REST_URL =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.REDIS_REST_URL || "";
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.REDIS_REST_TOKEN || "";

const K = {
  qr:     "card:opens:qr",      // فتحات جاءت من مسح الباركود
  all:    "card:opens:all",     // كل الفتحات
  people: "card:people",        // أجهزة مختلفة (set)
  day:    d => `card:opens:day:${d}`
};

/* تاريخ اليوم بتوقيت السعودية */
function riyadhDay(){
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

async function redis(commands){
  const r = await fetch(REST_URL.replace(/\/+$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  if(!r.ok) throw new Error(`redis ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const out = await r.json();
  return out.map(x => x.result);
}

const num = v => Number(v || 0);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if(!REST_URL || !REST_TOKEN){
    return res.status(200).json({ ok: true, configured: false });
  }

  const day = riyadhDay();

  try{
    if(req.method === "POST"){
      let body = req.body;
      if(typeof body === "string"){ try{ body = JSON.parse(body); }catch{ body = {}; } }
      body = body || {};

      const fromQR = body.src === "qr";
      const id = typeof body.id === "string" ? body.id.slice(0, 64) : "";

      const cmds = [["INCR", K.all], ["INCR", K.day(day)]];
      if(fromQR) cmds.push(["INCR", K.qr]);
      if(id)     cmds.push(["SADD", K.people, id]);
      cmds.push(["GET", K.qr], ["SCARD", K.people]);

      const r = await redis(cmds);
      return res.status(200).json({
        ok: true, configured: true,
        all: num(r[0]), today: num(r[1]),
        qr: num(r[r.length - 2]), people: num(r[r.length - 1])
      });
    }

    const r = await redis([
      ["GET", K.qr], ["GET", K.all], ["SCARD", K.people], ["GET", K.day(day)]
    ]);
    return res.status(200).json({
      ok: true, configured: true,
      qr: num(r[0]), all: num(r[1]), people: num(r[2]), today: num(r[3])
    });
  }catch(err){
    return res.status(200).json({ ok: false, configured: true, error: String(err.message || err) });
  }
};
