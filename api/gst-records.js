import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      let q = supabase.from('gst_records').select('*').order('id', { ascending: false });
      if (req.query.company_id) q = q.eq('company_id', Number(req.query.company_id));
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const b = req.body;
      if (!b.company_id || !b.period || !b.return_type) return res.status(400).json({ error: 'Missing required fields' });
      const { data, error } = await supabase.from('gst_records').insert({
        company_id: b.company_id, period: b.period, return_type: b.return_type,
        taxable_value: b.taxable_value || 0, tax_amount: b.tax_amount || 0,
        itc_claimed: b.itc_claimed || 0, status: b.status || 'Draft', filed_on: b.filed_on || '',
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase.from('gst_records').update(fields).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('gst_records').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
