import "./env.js";

export const NODE_ENV = process.env.NODE_ENV;
export const APP_PORT = process.env.JG_APP_PORT;
export const MONGO_URI = process.env.JG_MONGO_URI;
export const JWT_SECRET = process.env.JG_JWT_SECRET;
export const EXPIRES_IN = 3600 * 24; // 1 day
