// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_fat_korath.sql';
import m0001 from './0001_adorable_mockingbird.sql';
import m0002 from './0002_acoustic_martin_li.sql';
import m0003 from './0003_add_not_null_to_fk_columns.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  