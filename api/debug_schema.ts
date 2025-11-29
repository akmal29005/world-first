import { db } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const client = await db.connect();

    try {
        const { rows } = await client.sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'stories';
    `;

        return response.status(200).json({ columns: rows });
    } catch (error) {
        return response.status(500).json({ error });
    } finally {
        client.release();
    }
}
