const OWNER  = 'MarceloFurlong3';
const REPO   = 'municipio-app';
const BRANCH = 'dev';

export default async function handler(req, res) {
  const { tabla, order, limit, select, id, ...filters } = req.query;
  if (!tabla) return res.status(400).json({ error: 'falta tabla' });

  const TOKEN = process.env.GITHUB_DATA_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: 'GITHUB_DATA_TOKEN no configurado' });

  const FILE_PATH = `data/${tabla}.json`;
  const API_URL   = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
  const ghHeaders = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  const metaRes = await fetch(API_URL + `?ref=${BRANCH}`, { headers: ghHeaders });
  if (!metaRes.ok) {
    const err = await metaRes.json();
    return res.status(metaRes.status).json({ error: err.message });
  }
  const { sha, content: b64 } = await metaRes.json();
  let records = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));

  if (req.method === 'GET') {
    let result = [...records];

    // 1. Filtrar
    for (const [key, val] of Object.entries(filters)) {
      if (val.startsWith('not.eq.')) {
        const v = val.replace('not.eq.', '');
        const vParsed = v === 'true' ? true : v === 'false' ? false : v;
        result = result.filter(r => r[key] !== vParsed);
      } else if (val.startsWith('eq.')) {
        const v = val.replace('eq.', '');
        const vParsed = v === 'true' ? true : v === 'false' ? false : isNaN(v) ? v : Number(v);
        result = result.filter(r => r[key] === vParsed || String(r[key]) === v);
      }
    }

    // 2. Ordenar
    if (order) {
      const dotIdx = order.lastIndexOf('.');
      const campo = order.slice(0, dotIdx);
      const dir   = order.slice(dotIdx + 1);
      result.sort((a, b) => {
        const va = a[campo], vb = b[campo];
        if (va < vb) return dir === 'desc' ? 1 : -1;
        if (va > vb) return dir === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // 3. Seleccionar campos
    if (select) {
      const campos = select.split(',');
      result = result.map(r => Object.fromEntries(campos.map(c => [c, r[c]])));
    }

    // 4. Limitar
    if (limit) result = result.slice(0, parseInt(limit));

    return res.json(result);
  }

  if (req.method === 'POST') {
    const newRecord = { id: Date.now(), eliminado: false, ...req.body };
    records.push(newRecord);
    await commitFile(API_URL, ghHeaders, records, sha, `data: add to ${tabla}`);
    return res.status(201).json([newRecord]);
  }

  // PATCH / DELETE necesitan id
  if (!id) return res.status(400).json({ error: 'falta id' });
  const idVal = id.replace('eq.', '');

  if (req.method === 'PATCH') {
    records = records.map(r => String(r.id) === idVal ? { ...r, ...req.body } : r);
    await commitFile(API_URL, ghHeaders, records, sha, `data: patch ${tabla} ${idVal}`);
    return res.json([records.find(r => String(r.id) === idVal)]);
  }

  if (req.method === 'DELETE') {
    records = records.filter(r => String(r.id) !== idVal);
    await commitFile(API_URL, ghHeaders, records, sha, `data: delete from ${tabla}`);
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'método no soportado' });
}

async function commitFile(apiUrl, headers, records, sha, message) {
  const content = Buffer.from(JSON.stringify(records, null, 2)).toString('base64');
  const r = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content, sha }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || 'commit a GitHub fallido');
  }
}
