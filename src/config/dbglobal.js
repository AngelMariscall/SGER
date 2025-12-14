// Global Mongoose connection with singleton pattern.
// Production-friendly defaults and explanatory comments.
import mongoose from "mongoose";

// Keep a single cached connection instance for the global DB.
let globalConnection = null;
let hasLoggedGlobalConnect = false; // ensure logging only once

/**
 * Connects to the global MongoDB using a singleton connection.
 * - Loads URI from process.env.MONGO_URI_GLOBAL
 * - Reuses existing connection if already established
 * - Provides clean error handling suitable for production
 */
const connectDB = async () => {
    // If a connection already exists, reuse it.
    if (globalConnection && globalConnection.readyState === 1) {
        return globalConnection;
    }

    const uri = process.env.MONGO_URI_GLOBAL;
    if (!uri) {
        // Fail fast if env var is missing to avoid confusing runtime errors.
        throw new Error("MONGO_URI_GLOBAL no está definido en variables de entorno");
    }

    try {
        // Use mongoose.connect for the default/global connection.
        globalConnection = await mongoose.connect(uri, {
            // Best practices: keep connection stable; Mongoose v7+ sets sensible defaults.
            // You can add poolSize or tls options if required by Atlas.
            // serverSelectionTimeoutMS helps fail fast on misconfigurations.
            serverSelectionTimeoutMS: 10000,
        });

        if (!hasLoggedGlobalConnect) {
            console.log("[DB] Conectado al MongoDB GLOBAL (singleton)");
            hasLoggedGlobalConnect = true;
        }

        return globalConnection;
    } catch (error) {
        console.error("[DB] Error al conectar MongoDB GLOBAL:", error.message);
        // In production you might not want to exit the process immediately.
        // Throw to allow the caller to decide.
        throw error;
    }
};

export default connectDB;
