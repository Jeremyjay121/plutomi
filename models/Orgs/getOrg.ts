import { GetCommandInput, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoOrg } from '../../types/dynamo';

interface GetOrgInput {
  orgId: string;
}

export const getOrg = async (
  props: GetOrgInput,
): Promise<[DynamoOrg, undefined] | [undefined, SdkError]> => {
  const { orgId } = props;
  const params: GetCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    Key: {
      PK: `${Entities.ORG}#${orgId}`,
      SK: Entities.ORG,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoOrg, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
