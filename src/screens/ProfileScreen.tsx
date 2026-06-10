import { TabScreen } from '../components/app/TabScreen';
import { ProfileSummary } from '../components/profile/ProfileSummary';
import { user } from '../data/user';

export function ProfileScreen() {
  return (
    <TabScreen>
      <ProfileSummary
        name={user.name}
        description={user.description}
        pushEnabled
        soundEnabled
      />
    </TabScreen>
  );
}
