import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import AuthGuard from '../components/auth/AuthGuard';
import { PageSkeleton } from '../components/common/Skeleton';
import { ROLES, FEATURES } from '../utils/constants';

const page = (loader) => lazy(loader);
// public
const Home = page(() => import('../pages/public/Home'));
const About = page(() => import('../pages/public/About'));
const HowItWorks = page(() => import('../pages/public/HowItWorks'));
const NotFound = page(() => import('../pages/public/NotFound'));
const Directory = page(() => import('../pages/directory/Directory'));
const WorkerSearchResults = page(() => import('../pages/directory/WorkerSearchResults'));
const PublicWorkerProfile = page(() => import('../pages/profile/PublicWorkerProfile'));
// auth
const Login = page(() => import('../pages/auth/Login'));
const Register = page(() => import('../pages/auth/Register'));
const VerifyOTP = page(() => import('../pages/auth/VerifyOTP'));
const SelectCategory = page(() => import('../pages/auth/SelectCategory'));
// customer
const ConfirmReceipt = page(() => import('../pages/customer/ConfirmReceipt'));
const VerifyCustomerOTP = page(() => import('../pages/customer/VerifyCustomerOTP'));
const RateWorker = page(() => import('../pages/customer/RateWorker'));
// worker
const WDashboard = page(() => import('../pages/worker/Dashboard'));
const WProfile = page(() => import('../pages/worker/Profile'));
const EditProfile = page(() => import('../pages/worker/EditProfile'));
const CreateReceipt = page(() => import('../pages/worker/CreateReceipt'));
const WReceipts = page(() => import('../pages/worker/Receipts'));
const ReceiptDetails = page(() => import('../pages/worker/ReceiptDetails'));
const TrustScore = page(() => import('../pages/worker/TrustScore'));
const QRCode = page(() => import('../pages/worker/QRCode'));
const Settings = page(() => import('../pages/worker/Settings'));
const MyOrganizations = page(() => import('../pages/worker/MyOrganizations'));
// organization
const OrgDashboard = page(() => import('../pages/organization/OrganizationDashboard'));
const OrgProfile = page(() => import('../pages/organization/OrganizationProfile'));
const Members = page(() => import('../pages/organization/Members'));
const OrgJobs = page(() => import('../pages/organization/OrganizationJobs'));
// admin
const ADashboard = page(() => import('../pages/admin/Dashboard'));
const AUsers = page(() => import('../pages/admin/Users'));
const AWorkers = page(() => import('../pages/admin/Workers'));
const AOrganizations = page(() => import('../pages/admin/Organizations'));
const AReceipts = page(() => import('../pages/admin/Receipts'));
const AReports = page(() => import('../pages/admin/Reports'));
const AAuditLogs = page(() => import('../pages/admin/AuditLogs'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-8"><PageSkeleton /></div>}>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          {FEATURES.directory && <Route path="/directory" element={<Directory />} />}
          {FEATURES.directory && <Route path="/directory/search" element={<WorkerSearchResults />} />}
          <Route path="/w/:slug" element={<PublicWorkerProfile />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route element={<AuthGuard roles={[ROLES.WORKER]} />}>
          <Route path="/select-category" element={<SelectCategory />} />
        </Route>

        {/* Customer flow: public, opened from a WhatsApp / SMS link, no login, no app install */}
        <Route path="/confirm/:receiptId" element={<ConfirmReceipt />} />
        <Route path="/confirm/:receiptId/otp" element={<VerifyCustomerOTP />} />
        <Route path="/rate/:receiptId" element={<RateWorker />} />

        <Route element={<AuthGuard roles={[ROLES.WORKER]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/worker/dashboard" element={<WDashboard />} />
            <Route path="/worker/profile" element={<WProfile />} />
            <Route path="/worker/profile/edit" element={<EditProfile />} />
            <Route path="/worker/receipts" element={<WReceipts />} />
            <Route path="/worker/receipts/new" element={<CreateReceipt />} />
            <Route path="/worker/receipts/:id" element={<ReceiptDetails />} />
            <Route path="/worker/trust-score" element={<TrustScore />} />
            <Route path="/worker/qr" element={<QRCode />} />
            {FEATURES.organizations && <Route path="/worker/organizations" element={<MyOrganizations />} />}
            <Route path="/worker/settings" element={<Settings />} />
          </Route>
        </Route>

        {FEATURES.organizations && (
          <Route element={<AuthGuard roles={[ROLES.ORGANIZATION]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/organization/dashboard" element={<OrgDashboard />} />
              <Route path="/organization/profile" element={<OrgProfile />} />
              <Route path="/organization/members" element={<Members />} />
              <Route path="/organization/jobs" element={<OrgJobs />} />
            </Route>
          </Route>
        )}

        <Route element={<AuthGuard roles={[ROLES.ADMIN]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<ADashboard />} />
            <Route path="/admin/users" element={<AUsers />} />
            <Route path="/admin/workers" element={<AWorkers />} />
            <Route path="/admin/organizations" element={<AOrganizations />} />
            <Route path="/admin/receipts" element={<AReceipts />} />
            <Route path="/admin/reports" element={<AReports />} />
            <Route path="/admin/audit-logs" element={<AAuditLogs />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
