import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

// Allows updating the login link status for suspending it incase of malicious actors
export default async function UpdateLoginLink({
  user_id,
  login_link_timestamp,
  updated_login_link,
}) {
  // TODO user the cleaning functions instead
  const FORBIDDEN_KEYS = [
    "PK",
    "SK",
    "login_link_hash",
    "entity_type",
    "created_at",
    "user_id",
    "expires_at",
    "ttl_expiry",
  ];

  const incomingKeys = Object.keys(updated_login_link);
  const newKeys = incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = updated_login_link[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

  const params: UpdateCommandInput = {
    Key: {
      PK: `USER#${user_id}`,
      SK: `LOGIN_LINK#${login_link_timestamp}`,
    },
    UpdateExpression: UpdatedExpression,
    ExpressionAttributeValues: newAttributes,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}