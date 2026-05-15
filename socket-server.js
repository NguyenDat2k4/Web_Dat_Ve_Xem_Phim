const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
    methods: ["GET", "POST"]
  }
});

// Lưu trữ các ghế đang bị khóa: { [showtimeKey]: { [socketId]: [seats] } }
const lockedSeats = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-showtime", (showtimeKey) => {
    socket.join(showtimeKey);
    console.log(`User ${socket.id} joined showtime: ${showtimeKey}`);
    
    // Gửi danh sách ghế đang bị khóa hiện tại cho người mới vào
    const currentLocked = [];
    if (lockedSeats[showtimeKey]) {
      Object.values(lockedSeats[showtimeKey]).forEach(seats => {
        currentLocked.push(...seats);
      });
    }
    socket.emit("current-locked-seats", currentLocked);
  });

  socket.on("lock-seat", ({ showtimeKey, seatId }) => {
    if (!lockedSeats[showtimeKey]) lockedSeats[showtimeKey] = {};
    if (!lockedSeats[showtimeKey][socket.id]) lockedSeats[showtimeKey][socket.id] = [];
    
    lockedSeats[showtimeKey][socket.id].push(seatId);
    
    // Thông báo cho những người khác trong cùng phòng
    socket.to(showtimeKey).emit("seat-locked", seatId);
    console.log(`User ${socket.id} locked seat ${seatId} in ${showtimeKey}`);
  });

  socket.on("unlock-seat", ({ showtimeKey, seatId }) => {
    if (lockedSeats[showtimeKey] && lockedSeats[showtimeKey][socket.id]) {
      lockedSeats[showtimeKey][socket.id] = lockedSeats[showtimeKey][socket.id].filter(id => id !== seatId);
      
      socket.to(showtimeKey).emit("seat-unlocked", seatId);
      console.log(`User ${socket.id} unlocked seat ${seatId} in ${showtimeKey}`);
    }
  });

  socket.on("disconnecting", () => {
    // Giải phóng tất cả ghế của user này trước khi ngắt kết nối
    for (const room of socket.rooms) {
      if (lockedSeats[room] && lockedSeats[room][socket.id]) {
        const seats = lockedSeats[room][socket.id];
        seats.forEach(seatId => {
          socket.to(room).emit("seat-unlocked", seatId);
        });
        delete lockedSeats[room][socket.id];
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
