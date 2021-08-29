import { Dynamo } from "../../libs/ddbDocClient";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_id
 * @param funnel_id
 */
export async function GetFunnel(org_id: string, funnel_id: string) {
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `ORG#${org_id}#FUNNEL#${funnel_id}`,
      SK: `FUNNEL`,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item;
  } catch (error) {
    throw new Error(error);
  }
}