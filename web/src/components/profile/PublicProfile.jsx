import WorkerProfile from '../worker/WorkerProfile';
import ProfileStats from './ProfileStats';
import ProfileHighlights from './ProfileHighlights';
import WorkHistory from './WorkHistory';
import ContactWorker from './ContactWorker';
import TierBreakdown from '../receipt/TierBreakdown';
import EducationProfile from '../education/EducationProfile';
import PrivacyNote from '../common/PrivacyNote';

export default function PublicProfile({ profile, history = [] }) {
  return (
    <div className="space-y-6">
      <WorkerProfile worker={profile} actions={<ContactWorker worker={profile} />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2"><h2 className="mb-4">Track record</h2><ProfileHighlights profile={profile} /></div>
        <div className="card"><h2 className="mb-4">Verification mix</h2><TierBreakdown counts={profile.tierCounts} vertical={profile.vertical} /></div>
      </div>
      <ProfileStats profile={profile} />
      {profile.education && <EducationProfile data={profile.education} />}
      <div className="card">
        <h2 className="mb-2">Verified work history</h2>
        <WorkHistory items={history} />
      </div>
      <PrivacyNote>Every entry here was confirmed by the customer with an OTP. Customer phone numbers are never shown. Kaamnama is a directory: contact the worker directly.</PrivacyNote>
    </div>
  );
}
