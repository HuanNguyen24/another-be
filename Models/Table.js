import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Table extends Model {
    static init(sequelize, DataTypes) {
        return sequelize.define(
            'Table',
            {
                tableId: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                status: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                },
                active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    default: true,
                },
                numCustomer: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    default: 0,
                },
            },
            {
                tableName: 'Table',
                schema: 'public',
                timestamps: false,
                indexes: [
                    {
                        name: 'Table_pkey',
                        unique: true,
                        fields: [{ name: 'tableId' }],
                    },
                ],
            }
        );
    }
}
