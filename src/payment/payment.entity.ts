import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Order } from "../order/order.entity";
import { User } from "../user/user.entity";
import { PaymentStatus } from "./enums/payment-status.enum";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn() // <-- ID Integer Auto-increment
  id: number;

  @Index({ unique: true }) @Column({ type: "integer" }) orderId: number; // <-- FK Integer Unik
  @Index() @Column({ type: "integer" }) userId: number; // <-- FK Integer

  @Column({ type: "numeric", precision: 10, scale: 2 }) amount: number;
  @Column({ length: 50 }) paymentMethod: string;
  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;
  @Column({ type: "timestamp", nullable: true }) paymentDate: Date;
  @Column({ nullable: true, unique: true }) transactionId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToOne(() => Order, (order) => order.payment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order: Order;
  @ManyToOne(() => User, (user) => user.payments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
