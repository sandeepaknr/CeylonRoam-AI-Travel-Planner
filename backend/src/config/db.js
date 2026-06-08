const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.MONGO_URI_DIRECT;

  if (!primaryUri) {
    console.error("DB Error: MONGO_URI is not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(primaryUri);
    console.log("MongoDB connected");
  } catch (error) {
    const isSrvDnsError =
      error &&
      error.code === "ECONNREFUSED" &&
      error.syscall === "querySrv";

    if (isSrvDnsError && fallbackUri) {
      try {
        console.warn(
          "SRV DNS lookup failed. Retrying MongoDB with direct host URI..."
        );
        await mongoose.disconnect().catch(() => {});
        await mongoose.connect(fallbackUri);
        console.log("MongoDB connected (direct URI fallback)");
        return;
      } catch (fallbackError) {
        console.error("DB Error (fallback):", fallbackError.message);
        process.exit(1);
      }
    }

    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
