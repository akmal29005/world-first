import { db } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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
        reaction_heart INTEGER DEFAULT 0,
        reaction_metoo INTEGER DEFAULT 0,
        reaction_hug INTEGER DEFAULT 0,
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

            // --- Hugging Face Moderation Start ---
            console.log("Checking moderation with Hugging Face...");
            const hfToken = process.env.HUGGING_FACE_TOKEN;

            if (hfToken) {
                try {
                    const hf = new HfInference(hfToken);

                    // Using a specialized toxicity model
                    // 'unitary/toxic-bert' is a popular choice for this
                    const result = await hf.textClassification({
                        model: 'unitary/toxic-bert',
                        inputs: text
                    });

                    // Result is an array of objects: [{ label: 'toxic', score: 0.9 }, ...]
                    // We check if any "bad" label has a high score
                    const threshold = 0.7; // 70% confidence
                    const flagged = result.filter(item => item.score > threshold);

                    if (flagged.length > 0) {
                        console.warn("Story flagged by Hugging Face:", flagged);

                        // Map labels to "Shame Reasons"
                        // Labels from toxic-bert: toxic, severe_toxic, obscene, threat, insult, identity_hate
                        let reason = "General Naughtiness";
                        const topFlag = flagged.sort((a, b) => b.score - a.score)[0]; // Get highest score
                        const label = topFlag.label;

                        if (label === 'obscene') reason = "Too spicy for this map 🌶️";
                        else if (label === 'identity_hate') reason = "Hate speech is not cool 🚫";
                        else if (label === 'threat') reason = "Too violent! 💥";
                        else if (label === 'insult') reason = "Be nice to people! 🤝";
                        else if (label === 'toxic' || label === 'severe_toxic') reason = "Let's keep it friendly! 😊";

                        return response.status(400).json({
                            error: 'Story contains inappropriate content and cannot be posted.',
                            details: reason
                        });
                    }
                    console.log("Content safe.");

                } catch (modError) {
                    console.error("Moderation API error:", modError);
                    // Fail closed? Or open? Let's fail closed for safety, but log it.
                    return response.status(500).json({
                        error: 'Content moderation failed. Please try again later.',
                        details: modError instanceof Error ? modError.message : 'Unknown error'
                    });
                }
            } else {
                console.warn("HUGGING_FACE_TOKEN is missing. Skipping moderation.");
            }
            // --- Hugging Face Moderation End ---

            const { rows } = await client.sql`
        INSERT INTO stories (category, year, text, lat, lng, city, state, country)
        VALUES (${category}, ${year}, ${text}, ${lat}, ${lng}, ${city}, ${state}, ${country})
        RETURNING *;
      `;

            return response.status(201).json(rows[0]);
        }

        if (request.method === 'DELETE') {
            const { id } = request.query;

            if (!id) {
                return response.status(400).json({ error: 'Missing story ID' });
            }

            // Optional: Check for Authorization header here if we wanted strict API security
            // const authHeader = request.headers.authorization;
            // if (authHeader !== process.env.ADMIN_SECRET) { ... }

            await client.sql`DELETE FROM stories WHERE id = ${id as string}`;
            return response.status(200).json({ message: 'Story deleted' });
        }

        return response.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
}
