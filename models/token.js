'use strict';
const { Model } = require('sequelize');
const { tokenTypes } = require('../config/tokens');

module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Token.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  Token.init(
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 256],
            msg: 'Please insert a valid token',
          },
          notEmpty: {
            msg: 'Token should not be empty',
          },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [[tokenTypes.ACCESS, tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD]],
            msg: 'Invalid token type',
          },
          notEmpty: {
            msg: 'Token type should not be empty',
          },
        },
      },
      expires: DataTypes.DATE,
      blacklisted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Token',
      tableName: 'tokens',
    }
  );
  return Token;
};
