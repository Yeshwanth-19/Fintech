import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import usersRouter from "./users";
import giftsRouter from "./gifts";
import transactionsRouter from "./transactions";
import campaignsRouter from "./campaigns";
import walletRouter from "./wallet";
import notificationsRouter from "./notifications";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(usersRouter);
router.use(giftsRouter);
router.use(transactionsRouter);
router.use(campaignsRouter);
router.use(walletRouter);
router.use(notificationsRouter);
router.use(reportsRouter);

export default router;
