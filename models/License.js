const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const License = sequelize.define('License', {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    hwid: {
        type: DataTypes.STRING,
        allowNull: true
    },
    organization_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    customerEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    planType: {
        type: DataTypes.ENUM('Basic', 'Pro', 'Enterprise', 'Trial'),
        defaultValue: 'Trial'
    },
    billingCycle: {
        type: DataTypes.ENUM('Monthly', 'Yearly', 'Lifetime'),
        defaultValue: 'Monthly'
    },
    status: {
        type: DataTypes.ENUM('active', 'revoked', 'expired', 'pending'),
        defaultValue: 'pending'
    },
    activatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

module.exports = License;
