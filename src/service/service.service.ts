// src/service/service.service.ts
import {
  Injectable, // <-- Pastikan hanya ada satu
  NotFoundException, // <-- Pastikan hanya ada satu
  InternalServerErrorException, // <-- Pastikan hanya ada satu
  ConflictException, // <-- Pastikan hanya ada satu
  Logger, // <-- Pastikan hanya ada satu
  BadRequestException, // <-- Pastikan hanya ada satu
} from "@nestjs/common"; // <-- Semua dari @nestjs/common
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Service } from "./service.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServiceService {
  private readonly logger = new Logger(ServiceService.name);

  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    this.logger.log(`Attempting to create service: ${createServiceDto.name}`);
    const existingService = await this.serviceRepository.findOne({
      where: { name: createServiceDto.name },
    });
    if (existingService) {
      this.logger.warn(
        `Service creation failed: Name already exists - ${createServiceDto.name}`
      );
      throw new ConflictException(
        `Service with name "${createServiceDto.name}" already exists.`
      );
    }

    const service = this.serviceRepository.create(createServiceDto);
    try {
      const savedService = await this.serviceRepository.save(service);
      this.logger.log(
        `Service created successfully: ${savedService.id} (${savedService.name})`
      );
      return savedService;
    } catch (error) {
      this.logger.error(
        `Failed to create service ${createServiceDto.name}: ${error.message}`,
        error.stack
      );
      if (error.code === "23505") {
        throw new ConflictException(
          `Service with name "${createServiceDto.name}" already exists.`
        );
      }
      throw new InternalServerErrorException("Could not create service.");
    }
  }

  async findAll(): Promise<Service[]> {
    this.logger.log("Fetching all services");
    return this.serviceRepository.find({ order: { name: "ASC" } });
  }

  async findOne(id: number): Promise<Service> {
    this.logger.log(`Fetching service by ID: ${id}`);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException("Invalid Service ID format.");
    }
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      this.logger.warn(`Service not found: ${id}`);
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }
    return service;
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto
  ): Promise<Service> {
    this.logger.log(`Attempting to update service ID: ${id}`);
    const service = await this.findOne(id); // handles NotFoundException & invalid ID

    if (updateServiceDto.name && updateServiceDto.name !== service.name) {
      this.logger.log(
        `Checking for service name conflict for new name: ${updateServiceDto.name}`
      );
      const existingService = await this.serviceRepository.findOne({
        where: { name: updateServiceDto.name },
      });
      if (existingService && existingService.id !== id) {
        this.logger.warn(
          `Update failed: Service name ${updateServiceDto.name} already in use by service ${existingService.id}`
        );
        throw new ConflictException("Service name already in use.");
      }
    }

    Object.assign(service, updateServiceDto);

    try {
      const savedService = await this.serviceRepository.save(service);
      this.logger.log(`Service updated successfully: ${id}`);
      return savedService;
    } catch (error) {
      this.logger.error(
        `Failed to update service ${id}: ${error.message}`,
        error.stack
      );
      if (error.code === "23505") {
        throw new ConflictException("Service name already exists.");
      }
      throw new InternalServerErrorException("Could not update service.");
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Attempting to delete service ID: ${id}`);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException("Invalid Service ID format.");
    }
    const result = await this.serviceRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Delete failed: Service not found: ${id}`);
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }
    this.logger.log(`Service deleted successfully: ${id}`);
  }
}
