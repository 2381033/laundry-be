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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const order_status_enum_1 = require("../enums/order-status.enum");
class UpdateOrderDto {
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: order_status_enum_1.OrderStatus,
        description: "New status for the order",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(order_status_enum_1.OrderStatus),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 19.99,
        type: Number,
        description: "Corrected/Final total price (Admin only?)",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "totalPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 3.0,
        type: Number,
        description: "Corrected quantity",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Updated pickup date (ISO 8601)",
        example: "2024-03-15T11:00:00.000Z",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "pickupDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Updated delivery date (ISO 8601)",
        example: "2024-03-18T10:00:00.000Z",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: "Sudah termasuk biaya antar.",
        description: "Updated notes",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "notes", void 0);
//# sourceMappingURL=update-order.dto.js.map