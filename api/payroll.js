import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const cid = req.query.company_id ? Number(req.query.company_id) : null;
      let eq = supabase.from('employees').select('*').order('id');
      let rq = supabase.from('payroll_runs').select('*').order('id', { ascending: false });
      if (cid) { eq = eq.eq('company_id', cid); rq = rq.eq('company_id', cid); }
      const [{ data: employees, error: e1 }, { data: runs, error: e2 }] = await Promise.all([eq, rq]);
      if (e1) throw e1;
      if (e2) throw e2;
      return res.status(200).json({ employees, runs });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
