import { SettingsProvider } from './lib/settings';
import { useProgress } from './lib/progress';
import { useRoute, type Route } from './lib/router';
import { TopBar } from './components/TopBar';
import { Intro } from './pages/Intro';
import { Setup } from './pages/Setup';
import { FirstTaste } from './pages/FirstTaste';
import { Menu } from './pages/Menu';
import { ModulePage } from './pages/ModulePage';

function Page({ route }: { route: Route }) {
  const progress = useProgress();
  switch (route.page) {
    case 'setup':
      return <Setup />;
    case 'taste':
      return <FirstTaste />;
    case 'menu':
      return <Menu isDone={progress.isDone} onReset={progress.reset} />;
    case 'module':
      return <ModulePage moduleId={route.module} index={route.index} isDone={progress.isDone} markDone={progress.markDone} />;
    default:
      return <Intro />;
  }
}

export function App() {
  const route = useRoute();
  // The intro and setup screens stay bare: no settings bar until the student is in.
  const minimal = route.page === 'intro' || route.page === 'setup';
  return (
    <SettingsProvider>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {!minimal && <TopBar />}
      <Page route={route} />
    </SettingsProvider>
  );
}
