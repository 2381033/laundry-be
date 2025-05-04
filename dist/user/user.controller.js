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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../shared/guards/roles.guard");
const roles_decorator_1 = require("../shared/decorators/roles.decorator");
const user_decorator_1 = require("../shared/decorators/user.decorator");
const user_role_enum_1 = require("./enums/user-role.enum");
const user_entity_1 = require("./user.entity");
const user_response_dto_1 = require("./dto/user-response.dto");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    getProfile(currentUser) {
        return currentUser;
    }
    updateProfile(currentUser, updateUserDto) {
        return this.userService.update(currentUser.id, updateUserDto, currentUser);
    }
    async deleteProfile(currentUser) {
        await this.userService.remove(currentUser.id);
    }
    adminCreateUser(adminUser, createUserDto) {
        return this.userService.create(createUserDto, adminUser.role);
    }
    findAll() {
        return this.userService.findAll();
    }
    findOne(id) {
        return this.userService.findOne(id);
    }
    update(idToUpdate, adminUser, updateUserDto) {
        return this.userService.update(idToUpdate, updateUserDto, adminUser);
    }
    async remove(id) {
        await this.userService.remove(id);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)("me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: "Get current user profile" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", user_entity_1.User)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)("me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: "Update current user profile" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 409 }),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Delete)("me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: "Delete current user account" }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    __param(0, (0, user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteProfile", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Create a new user (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 201, type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 409 }),
    __param(0, (0, user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "adminCreateUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "List all users (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [user_response_dto_1.UserResponseDto] }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Get user by ID (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Update user by ID (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    (0, swagger_1.ApiResponse)({ status: 400 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    (0, swagger_1.ApiResponse)({ status: 409 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User,
        update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: "Delete user by ID (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    (0, swagger_1.ApiResponse)({ status: 401 }),
    (0, swagger_1.ApiResponse)({ status: 403 }),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)("Users"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("users"),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map