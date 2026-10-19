import { SettingsProvider } from './lib/settings';
import { useProgress } from './lib/progress';
import { useRoute } from './lib/router';
import { TopBar } from './components/TopBar';
import { Landing } from './pages/Landing';
import { Menu } from './pages/Menu';
import { ModulePage } from './pages/ModulePage';

function Routes() {
  const route = useRoute();
  const progress = useProgress();
  switch (route.page) {
    case 'menu':
      return <Menu isDone={progress.isDone} onReset={progress.reset} />;
    case 'module':
      return <ModulePage moduleId={route.module} index={route.index} isDone={progress.isDone} markDone={progress.markDone} />;
    default:
      return <Landing />;
  }
}

export function App() {
  return (
    <SettingsProvider>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <TopBar />
      <Routes />
    </SettingsProvider>
  );
}
