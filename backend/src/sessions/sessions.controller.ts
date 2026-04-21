import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { SessionsService } from './sessions.service';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('book')
  @Roles('PATIENT')
  book(@Request() req: any, @Body() data: { slotId: string; date: string; notes?: string; mode?: 'ONLINE' | 'IN_CLINIC' }) {
    return this.sessionsService.book(req.user.userId, data);
  }

  @Get('upcoming')
  getUpcoming(@Request() req: any) {
    return this.sessionsService.getUpcomingSessions(req.user.userId, req.user.role);
  }

  @Get('admin/all')
  @Roles('ADMIN')
  getAdminAll() {
    return this.sessionsService.getAdminAllSessions();
  }

  @Get('admin/stats')
  @Roles('ADMIN')
  getAdminStats() {
    return this.sessionsService.getAdminStats();
  }

  @Get('all')
  getAll(@Request() req: any) {
    return this.sessionsService.getAllSessions(req.user.userId, req.user.role);
  }

  @Patch(':id/cancel')
  cancel(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.cancelSession(req.user.userId, id, req.user.role);
  }

  @Patch(':id/complete')
  @Roles('THERAPIST')
  complete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.completeSession(req.user.userId, id);
  }

  @Get(':id/token')
  getToken(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.generateToken(req.user.userId, id);
  }

  @Get(':id/notes')
  @Roles('THERAPIST')
  getNotes(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.getNotes(req.user.userId, id);
  }

  @Patch(':id/notes')
  @Roles('THERAPIST')
  updateNotes(@Request() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() body: { notes: string }) {
    return this.sessionsService.updateNotes(req.user.userId, id, body.notes);
  }
}
