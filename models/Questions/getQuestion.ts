import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';

type GetQuestionInput = Pick<DynamoQuestion, 'orgId' | 'questionId'>;

export const getQuestion = async (
  props: GetQuestionInput,
): Promise<[DynamoQuestion, undefined] | [undefined, SdkError]> => {
  const { orgId, questionId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
      SK: Entities.QUESTION,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoQuestion, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
