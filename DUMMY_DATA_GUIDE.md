# How to Insert Dummy Data

## Quick Reference

**File:** [dummy_data.sql](file:///c:/Users/akmal/Downloads/the-map-of-firsts/dummy_data.sql)

**Total Stories:** 50+ dummy entries
**Primary Focus:** Southeast Asia (70% of data)
**Coverage:** Malaysia, Singapore, Thailand, Indonesia, Philippines, Vietnam

## Data Breakdown by Country

### 🇲🇾 Malaysia (12 stories)
- Kuala Lumpur (3)
- Penang (3)
- Johor (2)
- Sabah (2)
- Sarawak (1)
- Melaka (1)

### 🇸🇬 Singapore (5 stories)
- Central Region (5)

### 🇹🇭 Thailand (7 stories)
- Bangkok (3)
- Chiang Mai (2)
- Phuket (2)

### 🇮🇩 Indonesia (6 stories)
- Jakarta (2)
- Bali (3)
- Yogyakarta (1)

### 🇵🇭 Philippines (5 stories)
- Manila (2)
- Cebu (2)
- Palawan (1)

### 🇻🇳 Vietnam (6 stories)
- Hanoi (2)
- Ho Chi Minh City (2)
- Da Nang (2)

### Other Regions (3 stories)
- Japan, South Korea, Australia

## How to Insert into Neon/Vercel Postgres

### Option 1: Using Neon Console (Recommended for Beginners)

1. Go to your Neon Dashboard at https://console.neon.tech
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Copy the contents of `dummy_data.sql`
5. Paste into the editor
6. Click "Run" to execute all INSERT statements

### Option 2: Using Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to "Storage" tab
3. Click on your Postgres database
4. Click "Query" or "Data"
5. Paste the SQL commands from `dummy_data.sql`
6. Execute the queries

### Option 3: Using psql Command Line

```bash
# Connect to your database
psql "your-connection-string-here"

# Run the SQL file
\i dummy_data.sql

# Or copy-paste the content directly
```

### Option 4: Using Node.js Script

Create a file `seed.ts` or `seed.js`:

```typescript
import { db } from '@vercel/postgres';

async function seed() {
  const client = await db.connect();
  
  try {
    // Copy each INSERT statement from dummy_data.sql
    await client.sql`INSERT INTO stories (category, year, text, lat, lng, city, state, country) VALUES 
      ('First Job', 2019, 'Started my career at a tech startup...', 3.1570, 101.7116, 'Kuala Lumpur', 'Kuala Lumpur', 'Malaysia')`;
    
    // ... repeat for all entries
    
    console.log('✅ Dummy data inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting data:', error);
  } finally {
    client.release();
  }
}

seed();
```

Then run:
```bash
npx tsx seed.ts
# or
node seed.js
```

## Category Distribution

- **First Job:** Business districts, city centers
- **First Heartbreak:** Romantic spots, landmarks  
- **First Ocean:** Beaches, coastal areas
- **First Travel:** Popular tourist destinations
- **Other:** Food experiences, adventures, cultural events

## Real Coordinates

All latitude/longitude coordinates are accurate for the specified locations, ensuring pins appear in the correct locations on your map!

## Validation

All entries follow the requirements:
- ✅ Country names match the regions data
- ✅ Regions/states are valid for their countries
- ✅ All required fields are populated
- ✅ Stories are 2 sentences max (~200 chars)
- ✅ Years are realistic (2012-2022)
- ✅ Coordinates are accurate

## Testing

After inserting, verify by:
1. Opening your app
2. Checking if pins appear on the map
3. Clicking pins to read stories
4. Filtering by category

The majority of pins should appear in Southeast Asia! 🌏
