import { connectToDb } from "../db/connection";
import { getManagerModel } from "../db/models/managers";
import { getPropertyModel } from "../db/models/properties";
import type { IProperties } from "../db/models/properties";
import type { Sequelize } from "sequelize";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

let sequelize: Sequelize | null = null;
let Properties: IProperties | null = null;

export default async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!sequelize) {
    sequelize = await connectToDb();
    await getManagerModel(sequelize); // Ensure managers table is synced
    Properties = await getPropertyModel(sequelize);
  }

  const body = JSON.parse(event.body ?? "{}");

  // Optional: basic validation
  if (!body.managerId || !body.name || !body.address || !body.imgUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields." }),
    };
  }

  try {
    const createdProperty = await Properties.create(body, { returning: true });

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createdProperty.toJSON()),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to insert property", details: err.message }),
    };
  }
};
