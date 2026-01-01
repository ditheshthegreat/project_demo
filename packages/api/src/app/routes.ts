import { Router } from "express";
import { authRouter } from "../modules/auth/auth.module";
import { onboardingRouter } from "../modules/onboarding/onboarding.module";
import { communityRouter } from "../modules/community/community.module";
import { notificationsRouter } from "../modules/notifications/notifications.module";
import { chatRouter } from "../modules/chat/chat.module";

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

// Mount community module
router.use("/community", communityRouter);

// Mount notifications module
router.use("/notifications", notificationsRouter);

// Mount chat module
router.use("/chat", chatRouter);

export default router;
