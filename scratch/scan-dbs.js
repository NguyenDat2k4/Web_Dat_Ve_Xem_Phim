const mongoose = require('mongoose');

async function scanAllDatabases() {
    try {
        await mongoose.connect('mongodb://localhost:27017');
        const admin = mongoose.connection.useDb('admin').db.admin();
        const dbs = await admin.listDatabases();
        
        console.log("------------------------------------------");
        console.log("ALL DATABASES FOUND:");
        for (let db of dbs.databases) {
            console.log(`- ${db.name}`);
        }
        console.log("------------------------------------------");

        // Quét từng database để tìm bảng 'bookings'
        for (let dbInfo of dbs.databases) {
            if (dbInfo.name === 'admin' || dbInfo.name === 'local' || dbInfo.name === 'config') continue;
            
            const conn = mongoose.connection.useDb(dbInfo.name);
            const collections = await conn.db.listCollections().toArray();
            const names = collections.map(c => c.name);
            
            if (names.includes('bookings')) {
                const count = await conn.collection('bookings').countDocuments();
                console.log(`DB [${dbInfo.name}] has 'bookings' collection with ${count} items.`);
                
                if (count > 0) {
                    const latest = await conn.collection('bookings').find().sort({ _id: -1 }).limit(1).toArray();
                    console.log(`   Latest ID in [${dbInfo.name}]: ${latest[0]._id}`);
                    console.log(`   RecipientEmail: ${latest[0].recipientEmail || 'N/A'}`);
                }
            }
        }
        console.log("------------------------------------------");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
}

scanAllDatabases();
