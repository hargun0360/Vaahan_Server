const { Request, Response } = require("express");
const { db } = require("./db");
const moment = require("moment");

const typeMapping = {
  text: "VARCHAR",
  bigint: "BIGINT",
  date: "DATE",
  serial: "SERIAL",
  int: "INT",
};

const createEntity = async (req, res) => {
  const { entityName, attributes } = req.body;

  try {
    await db.schema.createTable(entityName, (table) => {
      table.string("id").primary();
      attributes.forEach((attr) => {
        const mappedType = typeMapping[attr.type];
        if (mappedType) {
          if (attr.isRequired === "YES") {
            table.specificType(attr.name, mappedType).notNullable();
          } else {
            table.specificType(attr.name, mappedType);
          }
        } else {
          throw new Error(`Invalid type: ${attr.type}`);
        }
      });
    });

    res.status(201).json({
      success: true,
      message: `Entity ${entityName} created`,
      status: 201,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error");
    }
  }
};

const createEntry = async (req, res) => {
  const { entity } = req.params;
  const data = req.body;

  try {
    const entitySchema = await db(entity).columnInfo();

    for (const [key, value] of Object.entries(entitySchema)) {
      if (key !== "id" && value.nullable === false && (data[key] === null || data[key] === undefined || data[key] === "")) {
        throw new Error(`Field "${key}" is required and cannot be null or empty`);
      }
    }

    const uniqueId = Date.now();
    data.id = uniqueId;
    console.log(data);
    
    await db(entity).insert(data);
    res.status(201).json({
      success: true,
      message: `Entry created with ID ${uniqueId}`,
      status: 201,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error");
    }
  }
};

const getEntries = async (req, res) => {
  const { entity } = req.params;
  try {
    const entries = await db(entity).select();
    const entitySchema = await db(entity).columnInfo();
    const attributes = Object.keys(entitySchema).map((key) => ({
      name: key,
      type: entitySchema[key].type,
    }));

    // Format date fields in entries
    const formattedEntries = entries.map((entry) => {
      const formattedEntry = { ...entry };
      for (const attr of attributes) {
        if (attr.type === 'date' && formattedEntry[attr.name]) {
          formattedEntry[attr.name] = moment(formattedEntry[attr.name]).format('DD-MM-YYYY');
        }
      }
      return formattedEntry;
    });

    res.status(200).json({ entries: formattedEntries, attributes });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error");
    }
  }
};

const updateEntry = async (req, res) => {
  const { entity, id } = req.params;
  const data = req.body;

  try {
    await db(entity).where("id", id).update(data);
    res.status(200).json({
      success: true,
      message: `Entry Updated`,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error");
    }
  }
};

const deleteEntry = async (req, res) => {
  const { entity, id } = req.params;

  try {
    await db(entity).where("id", id).del();
    res.status(200).json({
      success: true,
      message: `Entry Deleted`,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error");
    }
  }
};

const addAttribute = async (req, res) => {
  const { entityName, attribute } = req.body;
  const { name, type } = attribute;

  try {
    const mappedType = typeMapping[type];
    if (!mappedType) {
      throw new Error(`Invalid type: ${type}`);
    }

    const columnExists = await db.schema.hasColumn(entityName, name);
    if (columnExists) {
      throw new Error(
        `Column "${name}" already exists in entity "${entityName}"`
      );
    }

    await db.schema.table(entityName, (table) => {
      table.specificType(name, mappedType);
    });

    res.status(200).json({
      success: true,
      message: `Attribute ${name} added to entity ${entityName}`,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error");
    }
  }
};

const deleteAttribute = async (req, res) => {
  const { entityName, attributeName } = req.body;

  try {
    await db.schema.table(entityName, (table) => {
      table.dropColumn(attributeName);
    });

    res.status(200).json({
      success: true,
      message: `Attribute ${attributeName} deleted from entity ${entityName}`,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error");
    }
  }
};

const updateAttribute = async (req, res) => {
  const { entityName, oldAttribute, newAttribute } = req.body;

  try {
    await db.transaction(async (trx) => {
      if (oldAttribute.name !== newAttribute.name) {
        await trx.schema.table(entityName, (table) => {
          table.renameColumn(oldAttribute.name, newAttribute.name);
        });
      }

      if (oldAttribute.type !== newAttribute.type) {
        const mappedType = typeMapping[newAttribute.type];
        if (!mappedType) {
          throw new Error(`Invalid type: ${newAttribute.type}`);
        }
        await trx.schema.table(entityName, (table) => {
          table.specificType(newAttribute.name, mappedType).alter();
        });
      }
    });

    res.status(200).json({
      success: true,
      message: `Attribute ${oldAttribute.name} updated in entity ${entityName}`,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error("Unknown error:", error);
      res.status(500).send("Unknown error");
    }
  }
};

module.exports = {
  createEntity,
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
  addAttribute,
  deleteAttribute,
  updateAttribute,
};
