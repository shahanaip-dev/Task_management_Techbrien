"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const response_1 = require("../utils/response");
class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
        /** GET /api/v1/dashboard/summary */
        this.summary = async (req, res, next) => {
            try {
                const data = await this.dashboardService.getSummary(req.user);
                (0, response_1.sendSuccess)(res, data);
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map