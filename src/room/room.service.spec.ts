import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;

  beforeEach(() => {
    service = new RoomService();
  });

  it('returns the cached scene when the last participant leaves', () => {
    service.addParticipant('room-1', 'socket-a', 'Alice');
    service.addParticipant('room-1', 'socket-b', 'Bob');

    service.updateScene('room-1', [{ id: 'el-1' }]);

    const afterAlice = service.removeParticipant('socket-a');
    expect(afterAlice).not.toBeNull();
    expect(afterAlice!.scene).toBeNull();
    expect(afterAlice!.participants).toHaveLength(1);

    const afterBob = service.removeParticipant('socket-b');
    expect(afterBob).not.toBeNull();
    expect(afterBob!.scene).toEqual([{ id: 'el-1' }]);
    expect(afterBob!.participants).toHaveLength(0);
  });

  it('returns null scene for a non-last participant leave', () => {
    service.addParticipant('room-1', 'socket-a', 'Alice');
    service.addParticipant('room-1', 'socket-b', 'Bob');
    service.updateScene('room-1', [{ id: 'el-1' }]);

    const result = service.removeParticipant('socket-a');
    expect(result!.scene).toBeNull();
    expect(service.getParticipants('room-1')).toHaveLength(1);
  });

  it('does not hand back a stale scene after the room has been emptied and recreated', () => {
    service.addParticipant('room-1', 'socket-a', 'Alice');
    service.updateScene('room-1', [{ id: 'el-1' }]);
    const first = service.removeParticipant('socket-a');
    expect(first!.scene).toEqual([{ id: 'el-1' }]);

    // A new participant joins an empty room without drawing anything and leaves.
    service.addParticipant('room-1', 'socket-b', 'Bob');
    const second = service.removeParticipant('socket-b');
    expect(second!.scene).toBeNull();
  });

  it('persists latest scene over manual-save cache updates', () => {
    service.addParticipant('room-1', 'socket-a', 'Alice');
    service.updateScene('room-1', [{ id: 'el-1' }]);
    service.updateScene('room-1', [{ id: 'el-1' }, { id: 'el-2' }]);

    const result = service.removeParticipant('socket-a');
    expect(result!.scene).toEqual([{ id: 'el-1' }, { id: 'el-2' }]);
  });
});