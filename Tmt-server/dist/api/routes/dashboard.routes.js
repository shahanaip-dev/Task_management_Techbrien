"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = dashboardRouter;
const express_1 = require("express");
const dashboard_controller_1 = require("../../controllers/dashboard.controller");
const dashboard_service_1 = require("../../services/dashboard.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
function dashboardRouter(db) {
    const router = (0, express_1.Router)();
    const dashboardSvc = new dashboard_service_1.DashboardService(db);
    const controller = new dashboard_controller_1.DashboardController(dashboardSvc);
    router.use(auth_middleware_1.authenticate);
    router.get('/summary', controller.summary);
    return router;
}
//# sourceMappingURL=dashboard.routes.js.map