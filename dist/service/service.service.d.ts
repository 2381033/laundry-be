import { Repository } from "typeorm";
import { Service } from "./service.entity";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
export declare class ServiceService {
    private serviceRepository;
    private readonly logger;
    constructor(serviceRepository: Repository<Service>);
    create(createServiceDto: CreateServiceDto): Promise<Service>;
    findAll(): Promise<Service[]>;
    findOne(id: number): Promise<Service>;
    update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service>;
    remove(id: number): Promise<void>;
}
