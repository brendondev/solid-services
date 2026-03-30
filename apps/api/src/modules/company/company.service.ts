import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantContextService } from '../../core/tenant/tenant-context.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Busca dados da empresa (tenant)
   */
  async getCompanyData() {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        logo: true,
        companyName: true,
        tradingName: true,
        document: true,
        email: true,
        phone: true,
        website: true,
        street: true,
        number: true,
        complement: true,
        district: true,
        city: true,
        state: true,
        zipCode: true,
        stateRegistration: true,
        municipalRegistration: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Atualiza dados da empresa (tenant)
   */
  async updateCompanyData(updateData: UpdateCompanyDto) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
      select: {
        id: true,
        name: true,
        logo: true,
        companyName: true,
        tradingName: true,
        document: true,
        email: true,
        phone: true,
        website: true,
        street: true,
        number: true,
        complement: true,
        district: true,
        city: true,
        state: true,
        zipCode: true,
        stateRegistration: true,
        municipalRegistration: true,
        updatedAt: true,
      },
    });
  }
}
