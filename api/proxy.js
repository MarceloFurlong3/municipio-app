export default async function handler(req, res) {
  const { project, path: tabla, ...queryParams } = req.query;

  const configs = {
    municipio: {
      url: process.env.SUPA_MUNICIPIO_URL,
      key: process.env.SUPA_MUNICIPIO_KEY,
    },
    nk: {
      url: process.env.SUPA_NK_URL,
      key: process.env.SUPA_NK_KEY,
    },
  };

  const config = configs[project];
  if (!config?.url || !config?.key) {
    return res.status(400).json({ error: 'proyecto no válido o keys no configuradas' });
  }

  const qs = new URLSearchParams(queryParams).toString();
  const upstream = `${config.url}/rest/v1/${tabla}${qs ? '?' + qs : ''}`;

  const headers = {
    apikey: config.key,
    Authorization: 'Bearer ' + config.key,
    'Content-Type': 'application/json',
  };
  if (req.method === 'POST') headers['Prefer'] = 'return=representation';

  const upstream_res = await fetch(upstream, {
    method: req.method,
    headers,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });

  const data = await upstream_res.json();
  res.status(upstream_res.status).json(data);
}
