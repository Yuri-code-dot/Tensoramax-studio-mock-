import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      let q = supabase.from('bank_accounts').select('*').order('id');
      if (req.query.company_id) q = q.eq('company_id', Number(req.query.company_id));
      const { data: accounts, error } = await q;
      if (error) throw error;
      let transactions = [];
      const ids = (accounts || []).map((a) => a.id);
      if (ids.length) {
        const { data: t, error: e2 } = await supabase.from('bank_transactions').select('*')
          .in('account_id', ids).order('date', { ascending: false }).order('id', { ascending: false });
        if (e2) throw e2;
        transactions = t;
      }
      return res.status(200).json({ accounts, transactions });
    }
    if (req.method === 'PUT') {
      const { id, reconciled } = req.body;
      const { data, error } = await supabase.from('bank_transactions').update({ reconciled }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
