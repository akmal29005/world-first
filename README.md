# The Map of Firsts

The Map of Firsts is an interactive 3D visualization platform that allows users to anonymously record significant milestones in their lives. By placing pins on a global map, users contribute to a collective geography of human experience, marking locations associated with events such as their first love, first job, or first significant travel experience.

## Features

- **Interactive 3D Visualization**: A fully interactive globe built with D3.js and React, supporting smooth rotation, zooming, and momentum-based scrolling.
- **Anonymous Contributions**: Users can select a location and category to add their own stories to the map without requiring account registration.
- **Responsive Interface**: A modern, glassmorphism-inspired user interface that adapts seamlessly to both desktop and mobile devices.
- **Search and Filtering**: Robust tools to filter stories by category (e.g., First Heartbreak, First Ocean) or search by keywords and location.
- **Performance Optimized**: Custom animation loops ensure high-performance rendering (60fps) even on mobile devices.

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Visualization**: D3.js, TopoJSON
- **Data**: Vercel Postgres (Neon) for persistence
- **Build Tool**: Vite

## Local Development

Follow these steps to set up the project locally.

1. **Clone the repository**
   Download the source code to your local machine.

2. **Install Dependencies**
   Navigate to the project directory and install the required packages.
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory to configure necessary API keys.
   ```
   # Example configuration
   DATABASE_URL=your_database_connection_string
   ```

4. **Start the Development Server**
   Run the local development server.
   ```bash
   npm run dev
   ```

## Deployment

This project is optimized for deployment on Vercel.

1. **Build the Application**
   Generate the production build.
   ```bash
   npm run build
   ```

2. **Environment Variables**
   Ensure all environment variables (such as `DATABASE_URL`) are correctly configured in your hosting provider's dashboard.

## Project Structure

- `/components`: Reusable UI components including the Globe, StoryForm, and FilterBar.
- `/api`: Backend API routes for handling story submissions and retrieval.
- `/types`: TypeScript definitions for data models.
- `/public`: Static assets.

## License

This project is available for personal and educational use.
