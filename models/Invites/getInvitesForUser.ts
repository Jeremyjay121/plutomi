import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoOrgInvite, DynamoUser } from '../../types/dynamo';

type GetInvitesForUserInput = Pick<DynamoUser, 'userId'>;

export const getInvitesForUser = async (
  props: GetInvitesForUserInput,
): Promise<[DynamoOrgInvite[], undefined] | [undefined, SdkError]> => {
  const { userId } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': `${Entities.USER}#${userId}`,
      ':SK': Entities.ORG_INVITE,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items as DynamoOrgInvite[], undefined];
  } catch (error) {
    return [undefined, error];
  }
};
