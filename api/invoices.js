import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      let q = supabase.from('invoices').select('*').order('date', { ascending: false }).order('id', { ascending: false });
      if (req.query.company_id) q = q.eq('company_id', Number(req.query.company_id));
      if (req.query.inv_type) q = q.eq('inv_type', req.query.inv_type);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const b = req.body;
      if (!b.company_id || !b.invoice_no || !b.inv_type || !b.party) return res.status(400).json({ error: 'Missing required fields' });
      const { data, error } = await supabase.from('invoices').insert({
        company_id: b.company_id, invoice_no: b.invoice_no, inv_type: b.inv_type, party: b.party,
        date: b.date, due_date: b.due_date, subtotal: b.subtotal, cgst: b.cgst || 0, sgst: b.sgst || 0,
        igst: b.igst || 0, total: b.total, status: b.status || 'Unpaid', items: b.items || [],
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...fields } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase.from('invoices').update(fields).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
