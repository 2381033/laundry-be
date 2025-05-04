import { ServiceService } from "./service.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "./service.entity";
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    create(createServiceDto: CreateServiceDto): Promise<Service>;
    findAll(): Promise<Service[]>;
    findOne(id: number): Promise<Service>;
    update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service>;
    remove(id: number): Promise<void>;
}
