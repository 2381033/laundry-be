"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const update_payment_dto_1 = require("./dto/update-payment.dto");
const payment_query_dto_1 = require("./dto/payment-query.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../shared/guards/roles.guard");
const roles_decorator_1 = require("../shared/decorators/roles.decorator");
const user_decorator_1 = require("../shared/decorators/user.decorator");
const user_role_enum_1 = require("../user/enums/user-role.enum");
const payment_status_enum_1 = require("./enums/payment-status.enum");
const user_entity_1 = require("../user/user.entity");
const payment_entity_1 = require("./payment.entity");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    create(createPaymentDto, adminUser) {
        return this.paymentService.create(createPaymentDto, adminUser);
    }
    findMyPayments(user, queryDto) {
        return this.paymentService.findUserPayments(user.id, queryDto);
    }
    findAll(queryDto) {
        return this.paymentService.findAll(queryDto);
    }
    findOne(id, user) {
        return this.paymentService.findOne(id, user);
    }
    update(id, updatePaymentDto, adminUser) {
        return this.paymentService.update(id, updatePaymentDto, adminUser);
    }
    async remove(id, adminUser) {
        await this.paymentService.remove(id, adminUser);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Record a new payment (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 201, type: payment_entity_1.Payment }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    (0, swagger_1.ApiResponse)({ status: 409 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("my"),
    (0, swagger_1.ApiOperation)({ summary: "List payments made by the current user" }),
    (0, swagger_1.ApiQuery)({ name: "paymentStatus", required: false, enum: payment_status_enum_1.PaymentStatus }),
    (0, swagger_1.ApiQuery)({ name: "orderId", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Array of user's payments" }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        payment_query_dto_1.PaymentQueryDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findMyPayments", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "List all payments (Admin only)" }),
    (0, swagger_1.ApiQuery)({ name: "paymentStatus", required: false, enum: payment_status_enum_1.PaymentStatus }),
    (0, swagger_1.ApiQuery)({ name: "userId", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "orderId", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Array of all payments" }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_query_dto_1.PaymentQueryDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get details of a specific payment" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: payment_entity_1.Payment }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Update payment details (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: payment_entity_1.Payment }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    (0, swagger_1.ApiResponse)({ status: 409 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_payment_dto_1.UpdatePaymentDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: "Delete a payment record (Admin only - Use with caution!)",
    }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "remove", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)("Payments"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("payments"),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map