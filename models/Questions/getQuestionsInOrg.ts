import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';

export type GetQuestionsInOrgInput = Pick<DynamoQuestion, 'orgId'>;

export const getQuestionsInOrg = async (
  props: GetQuestionsInOrgInput,
): Promise<[DynamoQuestion[], undefined] | [undefined, SdkError]> => {
  const { orgId } = props;

  const params: QueryCommandInput = {
    IndexName: 'GSI1',
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.QUESTION}S`,
    },
  };

  try {
    const orgQuestions = await Dynamo.send(new QueryCommand(params));
    return [orgQuestions.Items as DynamoQuestion[], undefined];
  } catch (error) {
    return [undefined, error];
  }
};
