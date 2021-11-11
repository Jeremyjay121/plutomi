// Deletes the login link the user used to log in
import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";

const { DYNAMO_TABLE_NAME } = process.env;
export default async function DeleteLoginLink(
  userId: string,
  login_link_timestamp: string
) {
  try {
    const params: DeleteCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `LOGIN_LINK#${login_link_timestamp}`,
      },
    };

    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to delete login link ${error}`);
  }
}
