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
var ServiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_entity_1 = require("./service.entity");
let ServiceService = ServiceService_1 = class ServiceService {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
        this.logger = new common_1.Logger(ServiceService_1.name);
    }
    async create(createServiceDto) {
        this.logger.log(`Attempting to create service: ${createServiceDto.name}`);
        const existingService = await this.serviceRepository.findOne({
            where: { name: createServiceDto.name },
        });
        if (existingService) {
            this.logger.warn(`Service creation failed: Name already exists - ${createServiceDto.name}`);
            throw new common_1.ConflictException(`Service with name "${createServiceDto.name}" already exists.`);
        }
        const service = this.serviceRepository.create(createServiceDto);
        try {
            const savedService = await this.serviceRepository.save(service);
            this.logger.log(`Service created successfully: ${savedService.id} (${savedService.name})`);
            return savedService;
        }
        catch (error) {
            this.logger.error(`Failed to create service ${createServiceDto.name}: ${error.message}`, error.stack);
            if (error.code === "23505") {
                throw new common_1.ConflictException(`Service with name "${createServiceDto.name}" already exists.`);
            }
            throw new common_1.InternalServerErrorException("Could not create service.");
        }
    }
    async findAll() {
        this.logger.log("Fetching all services");
        return this.serviceRepository.find({ order: { name: "ASC" } });
    }
    async findOne(id) {
        this.logger.log(`Fetching service by ID: ${id}`);
        if (isNaN(id) || id <= 0) {
            throw new common_1.BadRequestException("Invalid Service ID format.");
        }
        const service = await this.serviceRepository.findOne({ where: { id } });
        if (!service) {
            this.logger.warn(`Service not found: ${id}`);
            throw new common_1.NotFoundException(`Service with ID "${id}" not found`);
        }
        return service;
    }
    async update(id, updateServiceDto) {
        this.logger.log(`Attempting to update service ID: ${id}`);
        const service = await this.findOne(id);
        if (updateServiceDto.name && updateServiceDto.name !== service.name) {
            this.logger.log(`Checking for service name conflict for new name: ${updateServiceDto.name}`);
            const existingService = await this.serviceRepository.findOne({
                where: { name: updateServiceDto.name },
            });
            if (existingService && existingService.id !== id) {
                this.logger.warn(`Update failed: Service name ${updateServiceDto.name} already in use by service ${existingService.id}`);
                throw new common_1.ConflictException("Service name already in use.");
            }
        }
        Object.assign(service, updateServiceDto);
        try {
            const savedService = await this.serviceRepository.save(service);
            this.logger.log(`Service updated successfully: ${id}`);
            return savedService;
        }
        catch (error) {
            this.logger.error(`Failed to update service ${id}: ${error.message}`, error.stack);
            if (error.code === "23505") {
                throw new common_1.ConflictException("Service name already exists.");
            }
            throw new common_1.InternalServerErrorException("Could not update service.");
        }
    }
    async remove(id) {
        this.logger.log(`Attempting to delete service ID: ${id}`);
        if (isNaN(id) || id <= 0) {
            throw new common_1.BadRequestException("Invalid Service ID format.");
        }
        const result = await this.serviceRepository.delete(id);
        if (result.affected === 0) {
            this.logger.warn(`Delete failed: Service not found: ${id}`);
            throw new common_1.NotFoundException(`Service with ID "${id}" not found`);
        }
        this.logger.log(`Service deleted successfully: ${id}`);
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = ServiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServiceService);
//# sourceMappingURL=service.service.js.map