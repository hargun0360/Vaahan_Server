import { Request, Response } from "express";
import { db } from "./db.js";

export const createEntity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { entityName, attributes } = req.body;

  try {
    await db.schema.createTable(entityName, (table) => {
      table.increments("id");
      attributes.forEach((attr: { name: string; type: string }) => {
        table.specificType(attr.name, attr.type);
      });
    });

    res.status(201).send(`Entity ${entityName} created`);
  } catch (error) {
    res.status(500).send(error.message);
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
    res.status(201).send("Entry created");
  } catch (error) {
    res.status(500).send(error.message);
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
    res.status(500).send(error.message);
  }
};

export const updateEntry = async (req : Request, res : Response) : Promise<void> => {
  const { entity, id } = req.params;
  const data = req.body;

  try {
    await db(entity).where('id', id).update(data);
    res.status(200).send('Entry updated');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteEntry = async (req : Request, res : Response) : Promise<void> => {
  const { entity, id } = req.params;

  try {
    await db(entity).where('id', id).del();
    res.status(200).send('Entry deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

