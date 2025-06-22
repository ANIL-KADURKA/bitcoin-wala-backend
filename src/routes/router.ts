import express from "express";
import { adminRouter } from "./admin-registration";
import { bitcoinRouter } from "./bitcoin";
import { subscriptionRouter } from "./subscribe";
import { announcementRouter } from "./announcement";
import '../cron/announcementCron'
import { cronRouter } from "./cronRouter";

export const router = express.Router();

router.use("/admin", adminRouter);
router.use("/bitcoin", bitcoinRouter);
router.use("/subscription", subscriptionRouter);
// router.use("/announcement", announcementRouter);
router.use("/cron", cronRouter);
