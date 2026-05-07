const Admin = require('./models/Admin');
const sequelize = require('./config/db');

async function forceReset() {
    try {
        await sequelize.sync();
        
        // 1. Delete the old account entirely to clear any plain-text passwords
        await Admin.destroy({ where: { username: 'admin' } });
        console.log('🗑️  Old admin account cleared.');

        // 2. Create a fresh account (This will trigger the hashing hook 100%)
        await Admin.create({ 
            username: 'admin', 
            password: 'Sarjun@7358' 
        });
        
        console.log('✅ NEW Admin created with secure hashed password!');
        console.log('Username: admin');
        console.log('Password: Sarjun@7358');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during force reset:', err.message);
        process.exit(1);
    }
}

forceReset();
