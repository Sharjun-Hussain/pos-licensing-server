const Admin = require('./models/Admin');
const sequelize = require('./config/db');

async function reset() {
    try {
        await sequelize.sync();
        const admin = await Admin.findOne({ where: { username: 'admin' } });
        
        if (!admin) {
            console.log('❌ Admin user not found. Creating a new one...');
            await Admin.create({ username: 'admin', password: 'Sarjun@7358' });
            console.log('✅ Created admin with password: Sarjun@7358');
        } else {
            admin.password = 'Sarjun@7358';
            await admin.save();
            console.log('✅ Password reset successfully for user: admin');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

reset();
