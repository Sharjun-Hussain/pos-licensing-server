const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

const License = sequelize.define('License', {
    key: { type: DataTypes.STRING, unique: true },
    hwid: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'active', 'expired', 'revoked'), defaultValue: 'pending' },
    customerEmail: { type: DataTypes.STRING },
    planType: { type: DataTypes.STRING, defaultValue: 'Pro' },
    billingCycle: { type: DataTypes.STRING, defaultValue: 'Yearly' },
    expiry: { type: DataTypes.DATE },
    activatedAt: { type: DataTypes.DATE }
});

async function seed() {
    await sequelize.sync();
    const key = 'INZEEDO-POS-PRO-TEST';
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    await License.create({
        key,
        customerEmail: 'tester@inzeedo.lk',
        planType: 'Enterprise',
        expiry,
        status: 'pending'
    });

    console.log('✅ Created Testing License Key: ' + key);
    process.exit(0);
}

seed();
