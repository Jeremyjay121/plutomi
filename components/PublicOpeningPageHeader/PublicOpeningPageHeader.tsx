import { useRouter } from 'next/router';
import usePublicOrgById from '../../SWR/usePublicOrgById';
import usePublicOpeningById from '../../SWR/usePublicOpeningById';
import { CustomQuery } from '../../types/main';
import { Loader } from '../Loader';

export const PublicOpeningPageHeader = () => {
  const router = useRouter();
  const { orgId, openingId } = router.query as Pick<CustomQuery, 'openingId' | 'orgId'>;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(orgId);
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(orgId, openingId);

  if (isOrgLoading) {
    return <Loader text="Loading..." />;
  }

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0 text-center space-y-2">
        <h2 className="text-3xl  font-extrabold leading-7 text-dark  sm:truncate">
          {org?.displayName}
        </h2>
        <h2 className=" text-2xl font-semibold leading-7 text-light  sm:truncate">
          {isOpeningLoading ? '' : `${opening?.openingName}`}
        </h2>
      </div>
    </div>
  );
};
