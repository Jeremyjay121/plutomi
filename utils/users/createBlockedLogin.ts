import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetUserByEmail } from "./getUserByEmail";
import { GetCurrentTime } from "../time";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 * @param user_email
 */
export async function BlockedLoginAttempt(user_email: string) {
  const user = await GetUserByEmail(user_email);

  if (!user)
    throw new Error(
      "User does not exist, unable to create blocked login attempt"
    );

  const { user_id } = user;
  const current_time = GetCurrentTime("iso");

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: {
      PK: `USER#${user_id}`,
      SK: `USER_LOGIN_ATTEMPT_BLOCKED#${current_time}`, // TODO add TTL expiry???
      entity_type: "LOGIN_ATTEMPT_BLOCKED",
      created_at: current_time,
      user_id: user_id,
      GSI1PK: user_email,
      GSI1SK: `USER_LOGIN_ATTEMPT_BLOCKED#${current_time}`,
    },
    ConditionExpression: "attribute_not_exists(PK)", // Shouldn't be needed
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}