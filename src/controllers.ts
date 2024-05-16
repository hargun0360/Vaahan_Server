import { Request, Response } from "express";
import { db } from "./db.js";

const typeMapping: { [key: string]: string } = {
  String: "VARCHAR",
  BigInt: "BIGINT",
  Date: "DATE",
};

export const createEntity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { entityName, attributes } = req.body;

  try {
    await db.schema.createTable(entityName, (table) => {
      table.increments("id");
      attributes.forEach((attr: { name: string; type: string }) => {
        const mappedType = typeMapping[attr.type];
        if (mappedType) {
          table.specificType(attr.name, mappedType);
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
    res.status(500).json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};

export const createEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { entity } = req.params;
  const data = req.body;

  try {
    await db(entity).insert(data);
    res.status(201).json({
      success: true,
      message: `Entry created`,
      status: 201,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};

export const getEntries = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { entity } = req.params;
  try {
    const entries = await db(entity).select();
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};

export const updateEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    res.status(500).json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};

export const deleteEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { entity, id } = req.params;

  try {
    await db(entity).where("id", id).del();
    res.status(200).json({
      success: true,
      message: `Entry Deleted`,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};

export const addAttribute = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    res.status(500).json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};

export const deleteAttribute = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    res.status(500).json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};

export const updateAttribute = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    res.status(500).json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};
