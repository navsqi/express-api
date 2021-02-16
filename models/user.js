'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: {
            args: true,
            msg: 'Please enter an valid email address',
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        valdate: {
          isNumber: {
            args: true,
            msg: 'Only digits are allowed',
          },
          len: {
            args: [10, 13],
            msg: 'Please insert an valid phone number',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 64],
            msg: 'Password must be greater than or equal to 3 characters',
          },
        },
      },
      photo: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        defaultValue: 'user',
        validate: {
          isIn: {
            args: [['user', 'admin']],
            msg: 'Invalid role name',
          },
        },
      },
      apiKey: DataTypes.STRING,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
      activationToken: DataTypes.STRING,
      resetToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
    }
  );

  User.addHook('beforeCreate', async (user, options) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(8);
      user.password = await bcrypt.hash(user.password, salt);

      const apiKey = crypto
        .createHash('sha256')
        .update(`${user.email}${Date.now}`)
        .digest('hex');

      user.apiKey = apiKey;
    }
  });

  return User;
};
