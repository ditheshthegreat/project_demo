import { Router } from "express";
import { authRouter } from "../modules/auth/auth.module";
import onboardingRoutes from "../modules/onboarding/interfaces/routes/onboarding.routes";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount auth module
router.use("/auth", authRouter);

// Mount onboarding module
router.use("/onboarding", onboardingRoutes);

export default router;
