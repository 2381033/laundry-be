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
exports.UpdatePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const payment_status_enum_1 = require("../enums/payment-status.enum");
class UpdatePaymentDto {
}
exports.UpdatePaymentDto = UpdatePaymentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: payment_status_enum_1.PaymentStatus, description: 'New status for the payment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(payment_status_enum_1.PaymentStatus),
    __metadata("design:type", String)
], UpdatePaymentDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'txn_789ghi012jkl', description: 'Updated/Added external transaction ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePaymentDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Credit Card Online', description: 'Updated payment method details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePaymentDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=update-payment.dto.js.map