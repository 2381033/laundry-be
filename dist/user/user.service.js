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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const user_role_enum_1 = require("./enums/user-role.enum");
const bcrypt = require("bcrypt");
let UserService = UserService_1 = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async create(createUserDto, creatorRole = user_role_enum_1.UserRole.CUSTOMER) {
        const { name, email, password, address, phoneNumber } = createUserDto;
        let role = createUserDto.role;
        if (role) {
            if (creatorRole !== user_role_enum_1.UserRole.ADMIN) {
                this.logger.warn(`Non-admin user attempted to set role during user creation for email: ${email}. Defaulting to CUSTOMER.`);
                role = user_role_enum_1.UserRole.CUSTOMER;
            }
            else if (!Object.values(user_role_enum_1.UserRole).includes(role)) {
                this.logger.warn(`Invalid role "${role}" provided by admin during user creation for email: ${email}. Defaulting to CUSTOMER.`);
                role = user_role_enum_1.UserRole.CUSTOMER;
            }
        }
        else {
            role = user_role_enum_1.UserRole.CUSTOMER;
        }
        this.logger.log(`Attempting to create user: ${email} with role: ${role}`);
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            this.logger.warn(`Email already exists: ${email}`);
            throw new common_1.ConflictException("Email already registered");
        }
        if (password === null || password === undefined) {
            this.logger.error(`Password is null or undefined for email: ${email}`);
            throw new common_1.BadRequestException("Password cannot be empty.");
        }
        const passwordString = String(password);
        if (passwordString.trim() === "") {
            this.logger.error(`Password is empty after string conversion for email: ${email}`);
            throw new common_1.BadRequestException("Password cannot be empty.");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordString, salt);
        this.logger.debug(`Password hashed for user: ${email}`);
        const user = this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            role,
            address,
            phoneNumber,
        });
        try {
            const savedUser = await this.userRepository.save(user);
            this.logger.log(`User created successfully: ${savedUser.id} (${email})`);
            delete savedUser.password;
            return savedUser;
        }
        catch (error) {
            this.logger.error(`Failed to create user ${email}: ${error.message}`, error.stack);
            if (error.code === "23505" ||
                error.message?.includes("duplicate key value violates unique constraint")) {
                throw new common_1.ConflictException("Email already registered");
            }
            throw new common_1.InternalServerErrorException("Could not create user.");
        }
    }
    async findAll() {
        this.logger.log("Fetching all users");
        return this.userRepository.find({ order: { name: "ASC" } });
    }
    async findOne(id) {
        this.logger.log(`Fetching user by ID: ${id}`);
        if (isNaN(id) || id <= 0) {
            this.logger.warn(`Attempted to find user with invalid ID: ${id}`);
            throw new common_1.BadRequestException("Invalid User ID format.");
        }
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            this.logger.warn(`User not found by ID: ${id}`);
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }
    async findOneByEmailWithPassword(email) {
        this.logger.log(`Fetching user by email (with password): ${email}`);
        const user = await this.userRepository
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();
        if (!user) {
            this.logger.debug(`User not found by email (for login attempt): ${email}`);
            return null;
        }
        return user;
    }
    async findOneByIdForAuth(id) {
        this.logger.log(`Fetching user by ID for auth validation: ${id}`);
        if (isNaN(id) || id <= 0) {
            this.logger.warn(`Invalid ID format received in findOneByIdForAuth: ${id}`);
            return null;
        }
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            this.logger.warn(`User not found by ID during auth validation: ${id}`);
            return null;
        }
        return user;
    }
    async update(id, updateUserDto, updatingUser) {
        this.logger.log(`Attempting to update user ID: ${id} by user ID: ${updatingUser.id}`);
        const userToUpdate = await this.findOne(id);
        const updatingUserRole = updatingUser.role;
        if (updatingUserRole !== user_role_enum_1.UserRole.ADMIN &&
            userToUpdate.id !== updatingUser.id) {
            this.logger.warn(`Forbidden attempt to update user ${id} by user ${updatingUser.id}`);
            throw new common_1.ForbiddenException("You do not have permission to update this user.");
        }
        let roleToSet = userToUpdate.role;
        if (updateUserDto.role && updateUserDto.role !== userToUpdate.role) {
            if (updatingUserRole !== user_role_enum_1.UserRole.ADMIN) {
                this.logger.warn(`Non-admin user ${updatingUser.id} attempted to change role for user ${id}.`);
                throw new common_1.ForbiddenException("You do not have permission to change user roles.");
            }
            if (userToUpdate.id === updatingUser.id &&
                updateUserDto.role !== user_role_enum_1.UserRole.ADMIN) {
                this.logger.warn(`Admin ${updatingUser.id} attempted to remove own admin role.`);
                throw new common_1.BadRequestException("Admins cannot remove their own admin role.");
            }
            roleToSet = updateUserDto.role;
        }
        if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
            this.logger.log(`Checking for email conflict for new email: ${updateUserDto.email}`);
            const whereCondition = {
                email: updateUserDto.email,
            };
            const existingUser = await this.userRepository.findOne({
                where: whereCondition,
            });
            if (existingUser && existingUser.id !== id) {
                this.logger.warn(`Update failed: Email ${updateUserDto.email} already in use by user ${existingUser.id}`);
                throw new common_1.ConflictException("Email already in use by another account.");
            }
            userToUpdate.email = updateUserDto.email;
        }
        if (updateUserDto.name !== undefined)
            userToUpdate.name = updateUserDto.name;
        if (updateUserDto.address !== undefined)
            userToUpdate.address = updateUserDto.address;
        if (updateUserDto.phoneNumber !== undefined)
            userToUpdate.phoneNumber = updateUserDto.phoneNumber;
        userToUpdate.role = roleToSet;
        try {
            const savedUser = await this.userRepository.save(userToUpdate);
            this.logger.log(`User updated successfully: ${id}`);
            return savedUser;
        }
        catch (error) {
            this.logger.error(`Failed to update user ${id}: ${error.message}`, error.stack);
            if (error.code === "23505" ||
                error.message?.includes("duplicate key value violates unique constraint")) {
                throw new common_1.ConflictException("Email already exists.");
            }
            throw new common_1.InternalServerErrorException("Could not update user.");
        }
    }
    async remove(id) {
        this.logger.log(`Attempting to delete user ID: ${id}`);
        if (isNaN(id) || id <= 0) {
            throw new common_1.BadRequestException("Invalid User ID format.");
        }
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            this.logger.warn(`Delete failed: User not found: ${id}`);
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        this.logger.log(`User deleted successfully: ${id}`);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map