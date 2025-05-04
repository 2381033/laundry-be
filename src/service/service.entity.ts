import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "../order/order.entity";

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn() // <-- ID Integer Auto-increment
  id: number;

  @Column({ unique: true, length: 100 }) name: string;
  @Column("text") description: string;
  @Column({ type: "numeric", precision: 10, scale: 2 }) price: number;
  @Column({ length: 50 }) estimatedDuration: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @OneToMany(() => Order, (order) => order.service) orders: Order[];
}
