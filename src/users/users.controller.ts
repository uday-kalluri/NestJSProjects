// users/users.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  me(@Req() req) { return req.user; }
}
