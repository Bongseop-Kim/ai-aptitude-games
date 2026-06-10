import { TabScreen } from '../components/app/TabScreen';
import { PlanCard } from '../components/billing/PlanCard';
import { InviteCodeCard } from '../components/retention/InviteCodeCard';
import { RadarChart } from '../components/reports/RadarChart';
import { ReportSection } from '../components/reports/ReportSection';
import { reportCompetencies } from '../data/reports';
import { subscriptionPlans } from '../data/subscriptions';

export function ReportsScreen() {
  return (
    <TabScreen>
      <RadarChart competencies={reportCompetencies} />
      <ReportSection title="강점 · 약점 Top 3" description="메타인지와 지속 주의가 강하고 관계 영역의 편차가 커요." />
      <InviteCodeCard code="SAEUM-82" />
      <PlanCard plan={subscriptionPlans[1]} />
    </TabScreen>
  );
}
