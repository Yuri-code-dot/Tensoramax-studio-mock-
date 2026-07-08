import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('app_users').select('*').order('id');
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, email, role } = req.body;
      if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
      const { data, error } = await supabase.from('app_users').insert({
        name, email, role: role || 'Viewer', status: 'Active', last_login: 'Never',
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...set } = req.body;
      const { data, error } = await supabase.from('app_users').update(set).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
