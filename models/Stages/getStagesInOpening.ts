import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoOpening, DynamoStage } from '../../types/dynamo';

type GetStagesInOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingId' | 'stageOrder'>;

export const getStagesInOpening = async (
  props: GetStagesInOpeningInput,
): Promise<[DynamoStage[], undefined] | [undefined, SdkError]> => {
  const { orgId, openingId, stageOrder } = props;
  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    const allStages = response.Items as DynamoStage[];

    // Orders results in the way the stageOrder is
    const result = stageOrder.map((i: string) => allStages.find((j) => j.stageId === i));
    return [result as DynamoStage[], undefined];
  } catch (error) {
    return [undefined, error];
  }
};
