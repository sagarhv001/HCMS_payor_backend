import PatientDashboard from './dashboards/PatientDashboard';
import ProviderDashboard from './dashboards/ProviderDashboard';
import PayorDashboard from './dashboards/PayorDashboard';
import Header from './Header';

export default function Dashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <main className="pt-20">
        {user.type === 'patient' && <PatientDashboard user={user} onLogout={onLogout} />}
        {user.type === 'provider' && <ProviderDashboard user={user} onLogout={onLogout} />}
        {user.type === 'payor' && <PayorDashboard payor={user} onLogout={onLogout} />}
      </main>
    </div>
  );
}
