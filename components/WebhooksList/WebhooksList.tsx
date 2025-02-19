import { PlusIcon } from '@heroicons/react/outline';
import useSelf from '../../SWR/useSelf';
import { DynamoWebhook } from '../../types/dynamo';
import useWebhooks from '../../SWR/useWebhooksInOrg';
import useStore from '../../utils/store';
import useOrgInfo from '../../SWR/useOrgInfo';
import { CreateWebhookModal } from '../CreateWebhookModal';
import { WebhookListItem } from '../WebhookListItem/WebhookListItem';
import { EmptyWebhooksContent } from '../EmptyWebhooksContent';
import { Loader } from '../Loader/Loader';

export const WebhooksList = () => {
  const { user, isUserLoading, isUserError } = useSelf();
  const { org, isOrgLoading, isOrgError } = useOrgInfo(user?.orgId);
  const { webhooks, isWebhooksLoading, isWebhooksError } = useWebhooks(user?.orgId);
  const openCreateWebhookModal = useStore((state) => state.openCreateWebhookModal);

  if (isWebhooksLoading) {
    return <Loader text="Loading webhooks..." />;
  }

  if (isWebhooksError) {
    return <h1 className="text-lg text-red-500">An error ocurred retrieving webhooks</h1>;
  }

  if (webhooks?.length === 0) {
    return <EmptyWebhooksContent />;
  }

  return (
    <>
      <CreateWebhookModal />
      <div className="flex-1 my-2 flex md:mt-0  items-center  md:flex-grow justify-center">
        <p className="mx-12">Total webhooks: {org?.totalWebhooks || webhooks?.length}</p>
        <button
          onClick={openCreateWebhookModal}
          type="button"
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Webhook
        </button>
      </div>
      <div>
        <ul className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4   ">
          {webhooks?.map((webhook: DynamoWebhook) => (
            <WebhookListItem key={webhook?.webhookId} webhook={webhook} />
          ))}
        </ul>
      </div>
    </>
  );
};
