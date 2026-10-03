process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/kaamnama_test_placeholder";
process.env.JWT_ACCESS_SECRET = "test_access_secret_0123456789abcdef0123456789abcdef";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_0123456789abcdef0123456789abcdef";
process.env.OTP_PROVIDER = "console";
process.env.OTP_RESEND_COOLDOWN_SECONDS = "0"; // no waiting between OTPs in tests
process.env.ENABLE_JOBS = "false";
process.env.CLIENT_URL = "http://localhost:5173";