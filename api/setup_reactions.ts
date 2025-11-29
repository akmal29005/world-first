import { db } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const client = await db.connect();

    try {
        // Add reaction columns if they don't exist
        await client.sql`
      ALTER TABLE stories 
      ADD COLUMN IF NOT EXISTS reaction_heart INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reaction_metoo INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reaction_hug INTEGER DEFAULT 0;
    `;

        return response.status(200).json({ message: 'Reactions columns added successfully' });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Internal Server Error', details: error });
    } finally {
        client.release();
    }
}
