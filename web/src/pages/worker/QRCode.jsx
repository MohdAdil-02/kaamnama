import PageHeader from '../../components/common/PageHeader';
import DataState from '../../components/common/DataState';
import ProfileQR from '../../components/profile/ProfileQR';
import useWorker from '../../hooks/useWorker';

export default function QRCode() {
  const res = useWorker();
  return (
    <>
      <PageHeader title="Your QR code" subtitle="Customers scan this to open your verified profile" />
      <DataState result={res}>
        {(d) => {
          const w = d.worker ?? d.data?.worker ?? d;
          return <div className="card mx-auto max-w-md"><ProfileQR slug={w.slug || w.publicId} /></div>;
        }}
      </DataState>
    </>
  );
}