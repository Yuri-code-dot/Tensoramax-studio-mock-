import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('companies').select('*').order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const b = req.body;
      if (!b.name) return res.status(400).json({ error: 'Company name is required' });
      const { data, error } = await supabase.from('companies').insert({
        name: b.name, gstin: b.gstin || '', pan: b.pan || '', state: b.state || '',
        address: b.address || '', fy_start: b.fy_start || '2024-04-01', fy_end: b.fy_end || '2025-03-31',
        is_active: false,
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, activate, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      if (activate) {
        const { error: e1 } = await supabase.from('companies').update({ is_active: false }).neq('id', id);
        if (e1) throw e1;
        const { data, error } = await supabase.from('companies').update({ is_active: true }).eq('id', id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('companies').update(fields).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      // Cascade: remove all data belonging to this company
      const { data: accts, error: eA } = await supabase.from('bank_accounts').select('id').eq('company_id', id);
      if (eA) throw eA;
      const acctIds = (accts || []).map((a) => a.id);
      if (acctIds.length) {
        const { error: eT } = await supabase.from('bank_transactions').delete().in('account_id', acctIds);
        if (eT) throw eT;
      }
      for (const table of ['bank_accounts', 'ledgers', 'vouchers', 'invoices', 'stock_items', 'employees', 'payroll_runs', 'parties', 'gst_records']) {
        const { error: eD } = await supabase.from(table).delete().eq('company_id', id);
        if (eD) throw eD;
      }
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
