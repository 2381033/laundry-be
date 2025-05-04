import { Repository } from "typeorm";
import { Order } from "./order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { User } from "../user/user.entity";
import { ServiceService } from "../service/service.service";
import { OrderQueryDto } from "./dto/order-query.dto";
export declare class OrderService {
    private orderRepository;
    private serviceService;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, serviceService: ServiceService);
    create(createOrderDto: CreateOrderDto, user: User): Promise<Order>;
    findAll(queryDto: OrderQueryDto): Promise<{
        data: Order[];
        total: number;
    }>;
    findUserOrders(userId: number, queryDto: OrderQueryDto): Promise<{
        data: Order[];
        total: number;
    }>;
    findOne(id: number, user: User): Promise<Order>;
    update(id: number, updateOrderDto: UpdateOrderDto, adminUser: User): Promise<Order>;
    cancelOrder(id: number, user: User): Promise<Order>;
    remove(id: number, adminUser: User): Promise<void>;
}
