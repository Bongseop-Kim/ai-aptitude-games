import { SectionHead } from '../components/app/SectionHead';
import { TabScreen } from '../components/app/TabScreen';
import { GameTile } from '../components/games/GameTile';
import { Grid } from '../design-system/components/Grid';
import { games } from '../data/games';

export function GamesScreen() {
  return (
    <TabScreen>
      <SectionHead title="모든 게임" actionLabel="진행도순" />
      <Grid columns={2} gap="x2">
        {games.map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </Grid>
    </TabScreen>
  );
}
