import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "../user/user.entity";
import { Service } from "../service/service.entity";
import { Payment } from "../payment/payment.entity";
import { OrderStatus } from "./enums/order-status.enum";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn() // <-- ID Integer Auto-increment
  id: number;

  @Index() @Column({ type: "integer" }) userId: number; // <-- FK Integer
  @Index() @Column({ type: "integer", nullable: true }) serviceId:
    | number
    | null; // <-- FK Integer Nullable

  @Column({ type: "numeric", precision: 10, scale: 2, default: 1 })
  quantity: number; // <-- Kolom Quantity

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  orderDate: Date;
  @Column({ type: "timestamp", nullable: true }) pickupDate: Date;
  @Column({ type: "timestamp", nullable: true }) deliveryDate: Date;
  @Index()
  @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;
  @Column({ type: "numeric", precision: 10, scale: 2 }) totalPrice: number;
  @Column({ type: "text", nullable: true }) notes?: string; // <-- Tambahkan Notes jika belum
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: "CASCADE",
    eager: false,
  })
  @JoinColumn({ name: "userId" })
  user: User;
  @ManyToOne(() => Service, (service) => service.orders, {
    onDelete: "SET NULL",
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: "serviceId" })
  service: Service | null;
  @OneToOne(() => Payment, (payment) => payment.order, {
    cascade: ["insert", "update"],
    nullable: true,
  })
  payment: Payment;
}
