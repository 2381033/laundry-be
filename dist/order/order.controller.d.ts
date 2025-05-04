import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderQueryDto } from "./dto/order-query.dto";
import { User } from "../user/user.entity";
import { Order } from "./order.entity";
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(createOrderDto: CreateOrderDto, user: User): Promise<Order>;
    findMyOrders(user: User, queryDto: OrderQueryDto): Promise<{
        data: Order[];
        total: number;
    }>;
    findAll(queryDto: OrderQueryDto): Promise<{
        data: Order[];
        total: number;
    }>;
    findOne(id: number, user: User): Promise<Order>;
    update(id: number, updateOrderDto: UpdateOrderDto, adminUser: User): Promise<Order>;
    cancelOrder(id: number, user: User): Promise<Order>;
    remove(id: number, adminUser: User): Promise<void>;
}
