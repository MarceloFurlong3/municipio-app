const GAS_URL = `https://script.google.com/macros/s/AKfycbzxCygphFeyT6x4s3eStxixxvbp0M4dk_WUKG1TgAuRgt2WujH8bA7O0VaJmXpo_bvS/exec`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let response;
    if (req.method === 'POST') {
      response = await fetch(GAS_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/json' },
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
      });
    } else {
      const params = new URLSearchParams(req.query).toString();
      response = await fetch(`${GAS_URL}?${params}`, { redirect: 'follow' });
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch {
      // GAS devolvió HTML (requiere re-autorización o está caído)
      console.error('GAS respuesta no-JSON:', text.substring(0, 200));
      return res.status(502).json({ error: 'El servidor de datos no está disponible. Puede requerir re-autorización.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
