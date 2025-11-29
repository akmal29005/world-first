import { db } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { storyId, type, action = 'add' } = request.body;

    if (!storyId || !['heart', 'metoo', 'hug'].includes(type) || !['add', 'remove'].includes(action)) {
        return response.status(400).json({ error: 'Invalid parameters' });
    }

    const client = await db.connect();

    try {
        // Increment or decrement based on action
        const operator = action === 'add' ? '+' : '-';

        // Use GREATEST to ensure count doesn't go below 0
        const query = `
      UPDATE stories 
      SET reaction_${type} = GREATEST(COALESCE(reaction_${type}, 0) ${operator} 1, 0)
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
