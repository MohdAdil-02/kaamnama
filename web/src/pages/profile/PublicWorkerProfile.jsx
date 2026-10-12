import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import DataState from '../../components/common/DataState';
import PublicProfile from '../../components/profile/PublicProfile';
import { profileApi } from '../../services/profileApi';

export default function PublicWorkerProfile() {
  const { slug } = useParams();
  const profile = useFetch(() => profileApi.getPublic(slug), [slug]);
  const ratings = useFetch(() => profileApi.getRatings(slug, { limit: 20 }), [slug]);
  const list = ratings.data?.data?.ratings ?? ratings.data?.ratings ?? [];
  return (
    <div className="container-page py-10">
      <DataState result={profile}>
        {(raw) => <PublicProfile profile={raw.data?.profile ?? raw.profile ?? raw} ratings={list} />}
      </DataState>
    </div>
  );
}