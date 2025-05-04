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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const order_query_dto_1 = require("./dto/order-query.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../shared/guards/roles.guard");
const roles_decorator_1 = require("../shared/decorators/roles.decorator");
const user_decorator_1 = require("../shared/decorators/user.decorator");
const user_role_enum_1 = require("../user/enums/user-role.enum");
const order_status_enum_1 = require("./enums/order-status.enum");
const user_entity_1 = require("../user/user.entity");
const order_entity_1 = require("./order.entity");
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }
    create(createOrderDto, user) {
        return this.orderService.create(createOrderDto, user);
    }
    findMyOrders(user, queryDto) {
        return this.orderService.findUserOrders(user.id, queryDto);
    }
    findAll(queryDto) {
        return this.orderService.findAll(queryDto);
    }
    findOne(id, user) {
        return this.orderService.findOne(id, user);
    }
    update(id, updateOrderDto, adminUser) {
        return this.orderService.update(id, updateOrderDto, adminUser);
    }
    cancelOrder(id, user) {
        return this.orderService.cancelOrder(id, user);
    }
    async remove(id, adminUser) {
        await this.orderService.remove(id, adminUser);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Place a new laundry order" }),
    (0, swagger_1.ApiResponse)({ status: 201, type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)("my"),
    (0, swagger_1.ApiOperation)({ summary: "List orders placed by the current user" }),
    (0, swagger_1.ApiQuery)({ name: "status", required: false, enum: order_status_enum_1.OrderStatus }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Array of user's orders",
    }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        order_query_dto_1.OrderQueryDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findMyOrders", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "List all orders (Admin only)" }),
    (0, swagger_1.ApiQuery)({ name: "status", required: false, enum: order_status_enum_1.OrderStatus }),
    (0, swagger_1.ApiQuery)({ name: "userId", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "serviceId", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Array of all orders" }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_query_dto_1.OrderQueryDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get details of a specific order" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Update order details (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_order_dto_1.UpdateOrderDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(":id/cancel"),
    (0, swagger_1.ApiOperation)({ summary: "Cancel an order (Customer, if eligible)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: order_entity_1.Order }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: "Delete an order (Admin only - Use with caution!)" }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "remove", null);
exports.OrderController = OrderController = __decorate([
    (0, swagger_1.ApiTags)("Orders"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("orders"),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map