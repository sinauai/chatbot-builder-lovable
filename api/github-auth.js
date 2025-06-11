import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let code;
  try {
    code = req.body.code;
    if (!code) throw new Error('No code provided');
  } catch (e) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  // 1. Tukar code dengan access token GitHub
  const tokenRes = await fetch('https://api.github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    res.status(400).json({ error: 'Failed to get access token from GitHub' });
    return;
  }

  // 2. Ambil data user dari GitHub
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const userData = await userRes.json();

  if (!userData || !userData.id) {
    res.status(400).json({ error: 'Failed to get user data from GitHub' });
    return;
  }

  // 3. Simpan data user ke Supabase (tabel profiles)
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userData.node_id || userData.id, // pastikan sesuai UUID jika perlu
      github_username: userData.login,
      github_avatar_url: userData.avatar_url,
      github_access_token: accessToken,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // 4. Kirim data user ke frontend
  res.status(200).json({ user: data ? data[0] : null });
} 