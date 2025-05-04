import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Order } from "../order/order.entity";
import { Payment } from "../payment/payment.entity";
import { UserRole } from "./enums/user-role.enum";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn() // <-- ID Integer Auto-increment
  id: number;

  @Column({ length: 100 }) name: string;
  @Index({ unique: true }) @Column({ unique: true, length: 100 }) email: string;
  @Column({ select: false }) password?: string;
  @Column({ type: "enum", enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;
  @Column({ nullable: true }) address: string;
  @Column({ nullable: true, length: 20 }) phoneNumber: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @OneToMany(() => Order, (order) => order.user) orders: Order[];
  @OneToMany(() => Payment, (payment) => payment.user) payments: Payment[];
}
