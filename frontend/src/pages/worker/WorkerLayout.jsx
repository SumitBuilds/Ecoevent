import { Outlet } from 'react-router-dom';
import PageWrapper from '../../components/shared/PageWrapper';

export default function WorkerLayout() {
  return (
    <PageWrapper role="worker">
      <Outlet />
    </PageWrapper>
  );
}
