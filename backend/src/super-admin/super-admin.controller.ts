import {Body,Controller,Get,Patch,Post,UseGuards,} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { AssignManagerDto } from './dto/assign-manager.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { SuperAdminService } from './super-admin.service';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  constructor(
    private readonly superAdminService: SuperAdminService,
  ) {}

  @Get('users')
  findAllUsers() {
    return this.superAdminService.findAllUsers();
  }

  @Post('assign-manager')
  assignManager(
    @Body() assignManagerDto: AssignManagerDto,
  ) {
    return this.superAdminService.assignManager(
      assignManagerDto,
    );
  }

  @Patch('users/role')
  updateUserRole(
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.superAdminService.updateUserRole(
      updateUserRoleDto,
    );
  }
}
