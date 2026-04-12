import Sidebar from './Sidebar';
import './PageWrapper.css';

export default function PageWrapper({ children, role = 'organizer' }) {
  return (
    <div className="page-wrapper">
      <Sidebar role={role} />
      <main className="page-content">
        {children}
      </main>
    </div>
  );
}
