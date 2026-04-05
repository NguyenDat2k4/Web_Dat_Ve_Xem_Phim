import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcryptjs from 'bcryptjs';
import User from '../models/User';
import Movie from '../models/Movie';
import Cinema from '../models/Cinema';
import Showtime from '../models/Showtime';
import Booking from '../models/Booking';
import Review from '../models/Review';
import News from '../models/News';
import Combo from '../models/Combo';
import Promotion from '../models/Promotion';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinemax';

const REAL_MOVIES = [
    { title: "Inside Out 2", trailer: "LEjhY29D29M", genre: "Animation", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800" },
    { title: "Deadpool & Wolverine", trailer: "73_1biulkYk", genre: "Action", image: "https://images.unsplash.com/photo-1563914841773-19bd6f2f646b?q=80&w=800" },
    { title: "Despicable Me 4", trailer: "qQlbKDOTR_U", genre: "Animation", image: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=800" },
    { title: "Dune: Part Two", trailer: "_YUzQa_1RCE", genre: "Sci-Fi", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800" },
    { title: "Moana 2", trailer: "hDZ7y8RP5HE", genre: "Animation", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800" },
    { title: "Wicked", trailer: "6W_vH1Yt00k", genre: "Musical", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800" },
    { title: "Gladiator II", trailer: "4rgYhTuP_L0", genre: "Action", image: "https://images.unsplash.com/photo-1505672678657-cc7037095e60?q=80&w=800" },
    { title: "Joker: Folie à Deux", trailer: "_OKAwz2jth0", genre: "Crime", image: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?q=80&w=800" },
    { title: "Furiosa", trailer: "XJMuhwVlca4", genre: "Action", image: "https://images.unsplash.com/photo-1568872307449-34a07049495b?q=80&w=800" },
    { title: "Kingdom of the Planet of the Apes", trailer: "Kdr5oedn7q4", genre: "Sci-Fi", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800" },
    { title: "Sonic 3", trailer: "qSu6i2iFKN0", genre: "Family", image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=800" },
    { title: "Mufasa", trailer: "o17FME6shV8", genre: "Adventure", image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800" },
    { title: "A Complete Unknown", trailer: "m6EueP_4FfU", genre: "Biopic", image: "https://images.unsplash.com/photo-1514525253344-93338981444e?q=80&w=800" },
    { title: "Nosferatu", trailer: "nulvWqzHUXo", genre: "Horror", image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=800" },
    { title: "Civil War", trailer: "aDyQxtg0V2w", genre: "Action", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800" }
];

const GENRES = ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Adventure", "Animation"];
const CATEGORIES = ['Khuyến mãi', 'Tin điện ảnh', 'Sự kiện'];
const STATUSES = ['pending', 'confirmed', 'cancelled', 'paid'];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        // 1. Seed Users
        console.log('Seeding Users...');
        const userPassword = await bcryptjs.hash('123456', 10);
        const users = [];
        for (let i = 0; i < 50; i++) {
            users.push({
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: userPassword,
                role: 'user',
                points: faker.number.int({ min: 0, max: 2000 })
            });
        }
        // Add one admin
        users.push({
            name: 'Admin User',
            email: 'admin@gmail.com',
            password: userPassword,
            role: 'admin',
            points: 1000000
        });
        const createdUsers = await User.insertMany(users);
        console.log(`- Created ${createdUsers.length} users`);

        // 2. Seed Movies
        console.log('Seeding Movies...');
        const movies = [];
        for (let i = 0; i < 50; i++) {
            const realMovie = REAL_MOVIES[i % REAL_MOVIES.length];
            movies.push({
                title: i < REAL_MOVIES.length ? realMovie.title : `${realMovie.title} - Chapter ${i}`,
                image: realMovie.image,
                rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
                duration: `${faker.number.int({ min: 90, max: 180 })} phút`,
                genre: i < REAL_MOVIES.length ? realMovie.genre : faker.helpers.arrayElement(GENRES),
                trailerUrl: i < REAL_MOVIES.length ? `https://www.youtube.com/watch?v=${realMovie.trailer}` : "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                description: faker.lorem.paragraphs(2),
                isComingSoon: faker.datatype.boolean(0.2),
                releaseDate: faker.date.soon({ days: 30 }).toISOString().split('T')[0],
                featured: faker.datatype.boolean(0.3)
            });
        }
        const createdMovies = await Movie.insertMany(movies);
        console.log(`- Created ${createdMovies.length} movies`);

        // 3. Seed Cinemas
        console.log('Seeding Cinemas...');
        const cinemas = [];
        const cities = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
        for (let i = 0; i < 50; i++) {
            const city = faker.helpers.arrayElement(cities);
            cinemas.push({
                name: `CineMax ${city} ${faker.location.street().split(' ')[0]}`,
                address: `${faker.location.streetAddress()}, ${city}`,
                phone: faker.phone.number(),
                email: `contact.${i}@cinemax.vn`,
                openTime: "08:00 - 23:00",
                image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800",
                rating: faker.number.float({ min: 4, max: 5, fractionDigits: 1 }),
                screens: faker.number.int({ min: 4, max: 12 })
            });
        }
        const createdCinemas = await Cinema.insertMany(cinemas);
        console.log(`- Created ${createdCinemas.length} cinemas`);

        // 4. Seed Showtimes
        console.log('Seeding Showtimes...');
        const showtimes = [];
        const times = ["09:00", "11:30", "14:00", "16:30", "19:00", "21:30", "23:45"];
        for (let i = 0; i < 100; i++) { // Creating more showtimes for variety
            showtimes.push({
                movie: faker.helpers.arrayElement(createdMovies)._id,
                cinema: faker.helpers.arrayElement(createdCinemas)._id,
                date: faker.date.soon({ days: 7 }).toISOString().split('T')[0],
                times: faker.helpers.arrayElements(times, { min: 2, max: 5 }),
                price: faker.helpers.arrayElement([75000, 85000, 95000, 110000])
            });
        }
        const createdShowtimes = await Showtime.insertMany(showtimes);
        console.log(`- Created ${createdShowtimes.length} showtime entries`);

        // 5. Seed Combos
        console.log('Seeding Combos...');
        const combos = [];
        const snackTypes = ["Bắp ngọt", "Bắp mặn", "Bắp phô mai", "Pepsi", "Coca-Cola", "Sprite", "Nacho"];
        for (let i = 0; i < 50; i++) {
            combos.push({
                name: `Combo ${faker.word.adjective()} ${i + 1}`,
                price: faker.number.int({ min: 50, max: 200 }) * 1000,
                description: `${faker.number.int({ min: 1, max: 2 })} ${faker.helpers.arrayElement(snackTypes)} + ${faker.number.int({ min: 1, max: 2 })} Nước lớn`,
                image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=800",
                isActive: true
            });
        }
        const createdCombos = await Combo.insertMany(combos);
        console.log(`- Created ${createdCombos.length} combos`);

        // 6. Seed Promotions
        console.log('Seeding Promotions...');
        const promotions = [];
        for (let i = 0; i < 50; i++) {
            promotions.push({
                code: `CINEMAX${faker.string.alphanumeric(5).toUpperCase()}`,
                description: `Giảm ${faker.number.int({ min: 10, max: 50 })}% cho vé xem phim`,
                discountType: 'percentage',
                value: faker.number.int({ min: 10, max: 30 }),
                minAmount: 100000,
                expiryDate: faker.date.future(),
                isActive: true
            });
        }
        const createdPromotions = await Promotion.insertMany(promotions);
        console.log(`- Created ${createdPromotions.length} promotions`);

        // 7. Seed News
        console.log('Seeding News...');
        const news = [];
        for (let i = 0; i < 50; i++) {
            const title = faker.lorem.sentence();
            news.push({
                title,
                slug: `${faker.helpers.slugify(title).toLowerCase()}-${faker.string.nanoid(5)}`,
                content: faker.lorem.paragraphs(5),
                thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                category: faker.helpers.arrayElement(CATEGORIES),
                author: 'Admin',
                views: faker.number.int({ min: 50, max: 5000 }),
                isActive: true,
                comments: []
            });
        }
        const createdNews = await News.insertMany(news);
        console.log(`- Created ${createdNews.length} news articles`);

        // 8. Seed Bookings
        console.log('Seeding Bookings...');
        const bookings = [];
        for (let i = 0; i < 100; i++) {
            const movie = faker.helpers.arrayElement(createdMovies);
            const cinema = faker.helpers.arrayElement(createdCinemas);
            const user = faker.helpers.arrayElement(createdUsers);
            bookings.push({
                movie: movie.title,
                cinema: cinema.name,
                date: faker.date.between({ from: '2024-01-01', to: '2025-12-31' }).toISOString().split('T')[0],
                time: "19:00",
                seats: ["H6", "H7"],
                totalPrice: faker.number.int({ min: 150, max: 400 }) * 1000,
                customerName: user.name,
                customerPhone: "0987654321",
                userEmail: user.email,
                status: faker.helpers.arrayElement(STATUSES),
                paymentMethod: 'VNPAY',
                combos: [
                    { name: "Family Combo", price: 150000, quantity: 1 }
                ]
            });
        }
        const createdBookings = await Booking.insertMany(bookings);
        console.log(`- Created ${createdBookings.length} booking records`);

        // 9. Seed Reviews
        console.log('Seeding Reviews...');
        const reviews = [];
        const movieUsers = new Set();
        for (let i = 0; i < 200; i++) {
            const user = faker.helpers.arrayElement(createdUsers);
            const movie = faker.helpers.arrayElement(createdMovies);
            const key = `${user._id}-${movie._id}`;
            if (movieUsers.has(key)) continue;
            movieUsers.add(key);

            reviews.push({
                user: user._id,
                movie: movie._id,
                rating: faker.number.int({ min: 3, max: 5 }),
                comment: faker.lorem.sentence(),
                createdAt: faker.date.past()
            });
        }
        const createdReviews = await Review.insertMany(reviews);
        console.log(`- Created ${createdReviews.length} reviews`);

        console.log('DATABASE SEEDED SUCCESSFULLY!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
