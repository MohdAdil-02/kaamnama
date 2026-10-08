import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import DataState from '../../components/common/DataState';
import WorkerProfile from '../../components/worker/WorkerProfile';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileHighlights from '../../components/profile/ProfileHighlights';
import EducationProfile from '../../components/education/EducationProfile';
import useWorker from '../../hooks/useWorker';

export default function Profile() {
  const res = useWorker();
  return (
    <>
      <PageHeader title="My profile" subtitle="This is how customers see you"
        action={<Link to="/worker/profile/edit"><Button icon={Pencil}>Edit profile</Button></Link>} />
      <DataState result={res}>
        {(w) => (
          <div className="space-y-6">
            <WorkerProfile worker={w} />
            <div className="card"><h2 className="mb-4">Track record</h2><ProfileHighlights profile={w} /></div>
            <ProfileStats profile={w} />
            <EducationProfile data={w.education} />
            {w.slug && <Link to={`/w/${w.slug}`} className="inline-block text-sm font-medium text-primary">View public profile</Link>}
          </div>
        )}
      </DataState>
    </>
  );
}
