// app/api/disasters/[id]/route.ts
import { supabase } from '@/lib/supabaseServer';
import { NextRequest } from 'next/server';
import { AuditEntry } from '@/types/disaster.type';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    const {
      title,
      location_name,
      latitude,
      longitude,
      description,
      tags,
      owner_id,
      existing_audit_trail
    } = body;

    const auditTrail: AuditEntry[] = [
      ...(existing_audit_trail || []),
      {
        action: 'update',
        user_id: owner_id,
        timestamp: new Date().toISOString()
      }
    ];

    const { data, error } = await supabase.rpc('update_disaster', {
      disaster_id: id,
      title,
      location_name,
      latitude,
      longitude,
      description,
      tags,
      audit: JSON.stringify(auditTrail)
    });

    if (error) {
      console.error('Supabase RPC error:', error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('PUT /disasters/:id internal error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

//DELETE
// app/api/disasters/[id]/route.ts

export async function DELETE(_: NextRequest, { params }: { params: { id: string } })
{
  try {
    const { id } = params;

    const { error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ message: `Disaster ${id} deleted successfully.` }),
      { status: 200 }
    );
  } 
  catch (err) {
    console.error('DELETE /disasters/:id error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
