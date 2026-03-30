import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuditService } from '../audit/audit.service';

@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Buscar dados da empresa' })
  @ApiResponse({ status: 200, description: 'Dados da empresa retornados com sucesso' })
  async getCompanyData() {
    return this.companyService.getCompanyData();
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar dados da empresa' })
  @ApiResponse({ status: 200, description: 'Dados da empresa atualizados com sucesso' })
  async updateCompanyData(
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const oldData = await this.companyService.getCompanyData();
    const updated = await this.companyService.updateCompanyData(updateCompanyDto);

    // Audit log
    await this.auditService.logUpdate({
      userId,
      entity: 'Tenant',
      entityId: tenantId,
      oldData,
      newData: updateCompanyDto,
    });

    return updated;
  }
}
