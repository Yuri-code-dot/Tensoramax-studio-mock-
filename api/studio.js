import supabase from './db-client.js';

const TABLES = {
  projects: 'studio_projects',
  models: 'studio_models',
  datasets: 'studio_datasets',
  deployments: 'studio_deployments',
  activity: 'studio_activity',
  notifications: 'studio_notifications',
  metrics: 'studio_metrics',
  users: 'app_users',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const resource = req.query.resource || (req.body && req.body.resource);
    const table = TABLES[resource];
    if (!table) return res.status(400).json({ error: `Unknown resource: ${resource}` });

    if (req.method === 'GET') {
      const desc = resource === 'activity' || resource === 'notifications';
      const { data, error } = await supabase.from(table).select('*').order('id', { ascending: !desc });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { resource: _r, ...fields } = req.body;
      const { data, error } = await supabase.from(table).insert(fields).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { resource: _r, id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase.from(table).update(fields).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
