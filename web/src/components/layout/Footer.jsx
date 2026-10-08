import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { FEATURES } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-muted">काम + नामा: a written record of work done, confirmed by the people you did it for.</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Product</p>
          <div className="flex flex-col gap-2 text-ink-muted">
            <Link to="/how-it-works">How it works</Link>
            {FEATURES.directory && <Link to="/directory">Verified directory</Link>}
            <Link to="/register">Create your record</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Your data</p>
          <p className="text-ink-muted">Your work history belongs to you and travels with you. You can request deletion at any time from Settings.</p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-muted">© {new Date().getFullYear()} Kaamnama. All rights reserved.</div>
    </footer>
  );
}
