import { PlusIcon } from '@heroicons/react/outline';
import useSelf from '../../SWR/useSelf';
import useOrgUsers from '../../SWR/useOrgUsers';
import useStore from '../../utils/store';
import usePendingOrgInvites from '../../SWR/usePendingOrgInvites';
import { DynamoOrgInvite } from '../../types/dynamo';
import { Loader } from '../Loader';
import { EmptyTeamContent } from '../EmptyTeamContent';
import { PendingInviteCard } from '../PendingInviteCard';
import { CreateInviteModal } from '../CreateInviteModal';
import { UserCard } from '../UserCard';

export const TeamPageContent = () => {
  // TODO clean up the pending invites section up
  const { user, isUserLoading, isUserError } = useSelf();
  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(user?.orgId);

  const { pendingOrgInvites, isPendingOrgInvitesLoading, isPendingOrgInvitesError } =
    usePendingOrgInvites(user?.orgId);
  const openInviteModal = useStore((state) => state.openInviteModal);
  if (isOrgUsersLoading) {
    return <Loader text="Loading team..." />;
  }

  if (isPendingOrgInvitesLoading) {
    return <h2>Loading pending invites</h2>;
  }

  if (isPendingOrgInvitesError) {
    return <h2>An error ocurred retrieving your pending invites</h2>;
  }

  const pendingInvites = (
    <ul className="divide-y divide-gray-200">
      {pendingOrgInvites.map((invite: DynamoOrgInvite) => (
        <PendingInviteCard key={invite.inviteId} invite={invite} />
      ))}
    </ul>
  );
  return (
    <>
      <CreateInviteModal />

      {orgUsers?.length > 1 ? (
        <div className="">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openInviteModal}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Team member
            </button>
          </div>
          {pendingInvites}
          {pendingOrgInvites?.length > 0 && (
            <div className=" mt-8 ">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-lg font-medium text-gray-900">Team</span>
                </div>
              </div>{' '}
            </div>
          )}

          {orgUsers?.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </div>
      ) : (
        <div>
          <EmptyTeamContent />

          {pendingOrgInvites?.length > 0 && (
            <div className=" mt-8 ">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-lg font-medium text-gray-900">
                    Pending Invites
                  </span>
                </div>
              </div>
            </div>
          )}
          {pendingInvites}
        </div>
      )}
    </>
  );
};
