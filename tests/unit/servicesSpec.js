describe('RoomService', function() {
  var RoomService, windowMock, baseURL, $httpBackend, room;

  beforeEach(module('opentok-meet'));
  beforeEach(function() {
    baseURL = 'https://mock.url/';
    windowMock = {
      location: {}
    };
    room = 'mockRoom';
    module(function($provide) {
      $provide.value('baseURL', baseURL);
      $provide.value('room', room);
      $provide.value('$window', windowMock);
    });
    inject(function(_RoomService_, $injector) {
      RoomService = _RoomService_;
      $httpBackend = $injector.get('$httpBackend');
    });
  });

  it('defines getRoom and changeRoom', function () {
    expect(RoomService.getRoom).toBeDefined();
    expect(RoomService.changeRoom).toBeDefined();
  });

  describe('changeRoom', function () {
    it('sets takes you back to the login screen', function () {
      RoomService.changeRoom();
      expect(windowMock.location.href).toBe(baseURL);
    });
  });

  describe('getRoom', function () {
    var mockRoomData;
    beforeEach(function () {
      mockRoomData = {
        room: 'mock'
      };
    });

    it('gets the room info and passes it along', function (done) {
      $httpBackend.expectGET(baseURL + room)
        .respond(200, JSON.stringify(mockRoomData));
      RoomService.getRoom().then(function (roomData) {
        expect(roomData).toEqual(mockRoomData);
        done();
      });
      $httpBackend.flush();
    });
  });
});
