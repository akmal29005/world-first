import { db } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    const client = await db.connect();

    try {
        // Ensure uuid extension FIRST (needed for uuid_generate_v4())
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

        // Then create table that uses the extension
        await client.sql`
      CREATE TABLE IF NOT EXISTS stories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category TEXT NOT NULL,
        year INTEGER NOT NULL,
        text TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        city TEXT,
        state TEXT,
        country TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        if (request.method === 'GET') {
            const { rows } = await client.sql`SELECT * FROM stories ORDER BY created_at DESC;`;
            return response.status(200).json(rows);
        }

        if (request.method === 'POST') {
            const { category, year, text, lat, lng, city, state, country } = request.body;

            if (!category || !text || !lat || !lng) {
                return response.status(400).json({ error: 'Missing required fields' });
            }

            const { rows } = await client.sql`
        INSERT INTO stories (category, year, text, lat, lng, city, state, country)
        VALUES (${category}, ${year}, ${text}, ${lat}, ${lng}, ${city}, ${state}, ${country})
        RETURNING *;
      `;

            return response.status(201).json(rows[0]);
        }

        return response.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // client.release() is handled by @vercel/postgres pool usually, but explicit connect() might need release if using raw client. 
        // db.connect() returns a VercelPoolClient which extends PoolClient.
        // Actually @vercel/postgres `db` is a VercelPool. `db.connect()` returns a client.
        // We should probably just use `sql` tag from `@vercel/postgres` directly for simple queries if we don't need transactions, 
        // but here we are doing multiple things.
        // Let's stick to the pattern.
        client.release();
    }
}
