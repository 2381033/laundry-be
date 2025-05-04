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
exports.ServiceController = void 0;
const common_1 = require("@nestjs/common");
const service_service_1 = require("./service.service");
const create_service_dto_1 = require("./dto/create-service.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../shared/guards/roles.guard");
const roles_decorator_1 = require("../shared/decorators/roles.decorator");
const user_role_enum_1 = require("../user/enums/user-role.enum");
const service_entity_1 = require("./service.entity");
let ServiceController = class ServiceController {
    constructor(serviceService) {
        this.serviceService = serviceService;
    }
    create(createServiceDto) {
        return this.serviceService.create(createServiceDto);
    }
    findAll() {
        return this.serviceService.findAll();
    }
    findOne(id) {
        return this.serviceService.findOne(id);
    }
    update(id, updateServiceDto) {
        return this.serviceService.update(id, updateServiceDto);
    }
    async remove(id) {
        await this.serviceService.remove(id);
    }
};
exports.ServiceController = ServiceController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new laundry service (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 201, type: service_entity_1.Service }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 409 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List all available laundry services" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [service_entity_1.Service] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get details of a specific laundry service" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: service_entity_1.Service }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update a laundry service (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: service_entity_1.Service }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    (0, swagger_1.ApiResponse)({ status: 409 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: "Delete a laundry service (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiceController.prototype, "remove", null);
exports.ServiceController = ServiceController = __decorate([
    (0, swagger_1.ApiTags)("Services"),
    (0, common_1.Controller)("services"),
    __metadata("design:paramtypes", [service_service_1.ServiceService])
], ServiceController);
//# sourceMappingURL=service.controller.js.map