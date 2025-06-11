import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function (req, res) {
  console.log('Received request to /api/github-auth');
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let code;
  try {
    code = req.body.code;
    console.log('Code received:', code ? 'exists' : 'does not exist');
    if (!code) throw new Error('No code provided');
  } catch (e) {
    console.error('Error parsing request body:', e);
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  // 1. Tukar code dengan access token GitHub
  try {
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
    console.log('GitHub token data:', tokenData);

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('Failed to get access token from GitHub, tokenData:', tokenData);
      res.status(400).json({ error: 'Failed to get access token from GitHub' });
      return;
    }

    // 2. Ambil data user dari GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();
    console.log('GitHub user data:', userData);

    if (!userData || !userData.id) {
      console.error('Failed to get user data from GitHub, userData:', userData);
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
      console.error('Supabase upsert error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    console.log('User data upserted to Supabase:', data);
    // 4. Kirim data user ke frontend
    res.status(200).json({ user: data ? data[0] : null });
  } catch (err) {
    console.error('Unhandled error in /api/github-auth:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; 