var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handlers/insertProperty.ts
var insertProperty_exports = {};
__export(insertProperty_exports, {
  default: () => insertProperty_default
});
module.exports = __toCommonJS(insertProperty_exports);

// src/db/connection.ts
var import_sequelize = require("sequelize");
var { TIMEOUT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
var timeout = Number(TIMEOUT) * 1e3;
var URI = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
var sequelize = null;
var connectToDb = async () => {
  if (sequelize) {
    sequelize.connectionManager.initPools();
    if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete sequelize.connectionManager.getConnection;
    }
    return sequelize;
  }
  sequelize = new import_sequelize.Sequelize(URI, {
    logging: false,
    pool: {
      min: 0,
      max: 2,
      idle: 0,
      acquire: 3e3,
      evict: timeout
    }
  });
  await sequelize.authenticate();
  return sequelize;
};

// src/db/models/managers.ts
var import_sequelize2 = require("sequelize");
var Managers = class extends import_sequelize2.Model {
};
var schema = {
  id: {
    type: import_sequelize2.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    // ✅ PK as per image
    allowNull: false
  },
  cognitoId: {
    type: import_sequelize2.DataTypes.STRING,
    unique: true,
    // ✅ Unique constraint
    allowNull: false
  },
  name: {
    type: import_sequelize2.DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: import_sequelize2.DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: import_sequelize2.DataTypes.STRING,
    allowNull: false
  }
};
var getManagerModel = async (sequelize3) => {
  if (sequelize3) {
    Managers.init(schema, {
      sequelize: sequelize3,
      modelName: "managers",
      tableName: "managers",
      timestamps: false
    });
    await Managers.sync();
  }
  return Managers;
};

// src/db/models/properties.ts
var import_sequelize3 = require("sequelize");
var Properties = class extends import_sequelize3.Model {
};
var schema2 = {
  id: {
    primaryKey: true,
    type: import_sequelize3.DataTypes.INTEGER,
    autoIncrement: true
  },
  name: {
    type: import_sequelize3.DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: import_sequelize3.DataTypes.STRING,
    allowNull: false
  },
  imgUrl: {
    type: import_sequelize3.DataTypes.STRING,
    allowNull: false
  },
  managerId: {
    type: import_sequelize3.DataTypes.UUID,
    allowNull: false,
    references: {
      model: "managers",
      key: "managerId"
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  }
};
var getPropertyModel = async (sequelize3) => {
  if (sequelize3) {
    Properties.init(schema2, { sequelize: sequelize3, modelName: "properties", timestamps: false });
    await Properties.sync();
  }
  return Properties;
};

// src/handlers/insertProperty.ts
var sequelize2 = null;
var Properties2 = null;
var insertProperty_default = async (event) => {
  if (!sequelize2) {
    sequelize2 = await connectToDb();
    await getManagerModel(sequelize2);
    Properties2 = await getPropertyModel(sequelize2);
  }
  const body = JSON.parse(event.body ?? "{}");
  if (!body.managerId || !body.name || !body.address || !body.imgUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields." })
    };
  }
  try {
    const createdProperty = await Properties2.create(body, { returning: true });
    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(createdProperty.toJSON())
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to insert property", details: err.message })
    };
  }
};
//# sourceMappingURL=insertProperty.js.map
