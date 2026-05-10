const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActivationLog = sequelize.define('ActivationLog', {
    licenseKey: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hwid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    action: {
        type: DataTypes.STRING, // 'activate', 'sync', 'fail'
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, // 'success', 'failure'
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    userEmail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    organizationName: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = ActivationLog;
