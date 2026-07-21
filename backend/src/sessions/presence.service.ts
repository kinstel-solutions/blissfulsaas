import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomPresenceService {
  private activeUsers = new Map<string, number>();

  ping(userId: string) {
    this.activeUsers.set(userId, Date.now());
  }

  isUserInRoom(userId: string): boolean {
    const lastSeen = this.activeUsers.get(userId);
    if (!lastSeen) return false;
    return Date.now() - lastSeen < 15000; // 15 seconds
  }
}
