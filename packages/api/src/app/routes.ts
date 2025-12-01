import { Router } from "express";
import { authRouter } from "../modules/auth/auth.module";
import { onboardingRouter } from "../modules/onboarding/onboarding.module";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount auth module
router.use("/auth", authRouter);

// Mount onboarding module
router.use("/onboarding", onboardingRouter);

export default router;
