import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import DataState from '../../components/common/DataState';
import PublicProfile from '../../components/profile/PublicProfile';
import { profileApi } from '../../services/profileApi';

export default function PublicWorkerProfile() {
  const { slug } = useParams();
  const profile = useFetch(() => profileApi.getPublic(slug), [slug]);
  const history = useFetch(() => profileApi.getHistory(slug, { limit: 20 }), [slug]);
  return (
    <div className="container-page py-10">
      <DataState result={profile}>
        {(p) => <PublicProfile profile={p} history={history.data?.items ?? history.data ?? []} />}
      </DataState>
    </div>
  );
}
