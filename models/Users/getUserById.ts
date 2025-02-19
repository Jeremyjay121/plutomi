import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoUser } from '../../types/dynamo';

interface GetUserByIdInput {
  userId: string;
}

export const getUserById = async (
  props: GetUserByIdInput,
): Promise<[DynamoUser, undefined] | [undefined, SdkError]> => {
  const { userId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.USER}#${userId}`,
      SK: Entities.USER,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoUser, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
