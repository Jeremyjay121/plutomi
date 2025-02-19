import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoOpening } from '../../types/dynamo';

type GetOpeningByIdInput = Pick<DynamoOpening, 'orgId' | 'openingId'>;

export const getOpening = async (
  props: GetOpeningByIdInput,
): Promise<[DynamoOpening, undefined] | [undefined, SdkError]> => {
  const { orgId, openingId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
      SK: Entities.OPENING,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoOpening, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
