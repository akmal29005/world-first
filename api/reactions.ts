import { db } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { storyId, type } = request.body;

    if (!storyId || !['heart', 'metoo', 'hug'].includes(type)) {
        return response.status(400).json({ error: 'Invalid parameters' });
    }

    const client = await db.connect();

    try {
        // Increment the specific reaction count
        // Note: We use dynamic column name but validate 'type' strictly above to prevent SQL injection
        const query = `
      UPDATE stories 
      SET reaction_${type} = COALESCE(reaction_${type}, 0) + 1 
      WHERE id = $1 
      RETURNING *;
    `;

        const { rows } = await client.query(query, [storyId]);

        if (rows.length === 0) {
            return response.status(404).json({ error: 'Story not found' });
        }

        return response.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
}
