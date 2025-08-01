import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();

// Register all routes without starting the server  
registerRoutes(app);

// Export for Vercel
export default app;
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register your API routes
registerRoutes(app);

// Export the Express app as a serverless function
export default app;
