import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoLoginLink } from '../../types/dynamo';

interface GetLatestLoginLinkInput {
  userId: string;
}

export const getLatestLoginLink = async (
  props: GetLatestLoginLinkInput,
): Promise<[DynamoLoginLink, undefined] | [undefined, SdkError]> => {
  const { userId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.USER}#${userId}#${Entities.LOGIN_LINK}S`, // TODO login links dont need GSIs, begins_with login link
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items[0] as DynamoLoginLink, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
