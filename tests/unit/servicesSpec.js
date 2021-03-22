const angular = require('angular');
// require('angular-mocks');
require('../../src/js/app.js');

describe('RoomService', () => {
  let RoomService;
  let windowMock;
  let baseURL;
  let $httpBackend;
  let room;
  let tokenRole;

  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(() => {
    baseURL = 'https://mock.url/';
    windowMock = {
      location: {},
    };
    tokenRole = 'moderator';
    room = 'mockRoom';
    angular.mock.module(($provide) => {
      $provide.value('baseURL', baseURL);
      $provide.value('room', room);
      $provide.value('$window', windowMock);
      $provide.value('tokenRole', tokenRole);
    });
    inject((_RoomService_, $injector) => {
      RoomService = _RoomService_;
      $httpBackend = $injector.get('$httpBackend');
    });
  });

  it('defines getRoom and changeRoom', () => {
    expect(RoomService.getRoom).toBeDefined();
    expect(RoomService.changeRoom).toBeDefined();
  });

  describe('changeRoom', () => {
    it('sets takes you back to the login screen', () => {
      RoomService.changeRoom();
      expect(windowMock.location.href).toBe(baseURL);
    });
  });

  describe('getRoom', () => {
    let mockRoomData;
    beforeEach(() => {
      mockRoomData = {
        room: 'mock',
      };
    });

    it('gets the room info and passes it along', (done) => {
      $httpBackend.expectGET(`${baseURL}${room}?tokenRole=${tokenRole}`)
        .respond(200, JSON.stringify(mockRoomData));
      RoomService.getRoom().then((roomData) => {
        expect(roomData).toEqual(mockRoomData);
        done();
      });
      $httpBackend.flush();
    });
  });
});
