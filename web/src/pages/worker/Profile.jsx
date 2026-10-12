import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import DataState from '../../components/common/DataState';
import PublicProfile from '../../components/profile/PublicProfile';
import useWorker from '../../hooks/useWorker';
import useFetch from '../../hooks/useFetch';
import { profileApi } from '../../services/profileApi';

export default function Profile() {
  const res = useWorker();
  return (
    <>
      <PageHeader title="My profile" subtitle="This is how customers see you"
        action={<Link to="/worker/profile/edit"><Button icon={Pencil}>Edit profile</Button></Link>} />
      <DataState result={res}>
        {(raw) => {
          const w = raw.data?.worker ?? raw.worker ?? raw;
          // The worker record uses the same field names as the public profile
          return <Own worker={{ ...w, memberSince: w.createdAt }} />;
        }}
      </DataState>
    </>
  );
}

function Own({ worker }) {
  const ratings = useFetch(() => profileApi.getRatings(worker.slug, { limit: 10 }), [worker.slug]);
  const list = ratings.data?.data?.ratings ?? ratings.data?.ratings ?? [];
  return (
    <div className="space-y-4">
      <PublicProfile profile={worker} ratings={list} />
      {worker.slug && <Link to={`/w/${worker.slug}`} className="inline-block text-sm font-medium text-primary">View public profile</Link>}
    </div>
  );
}