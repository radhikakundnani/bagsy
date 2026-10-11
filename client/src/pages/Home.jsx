import { useNavigate } from 'react-router-dom';
import { Bell, CloudSun, ListChecks, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Button, IconBadge, Squiggle } from '../components/ui';

const FEATURES = [
  { title: 'Weather', icon: CloudSun, tint: 'bg-sky', text: 'Forecast for your exact dates, or typical weather for trips months away.' },
  { title: 'Your list', icon: ListChecks, tint: 'bg-sun', text: 'Grouped and filterable, so you can review everything in a minute.' },
  { title: 'Pack together', icon: UsersRound, tint: 'bg-lilac', text: 'Invite your crew with a link. Everyone gets a list, the admin sees them all.' },
  { title: 'Reminders', icon: Bell, tint: 'bg-lime', text: 'A nudge 3 days before you leave, with what’s still unpacked.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { token } = useAuth();

  return (
    <Layout wide>
      <section className="mx-auto max-w-3xl pt-6 text-center md:pt-10">
        <p className="eyebrow">Packing lists that check the weather for you</p>
        <h1 className="font-display mt-4 text-5xl sm:text-7xl">
          Pack once.
          <br />
          <span className="relative inline-block">
            <span className="font-accent">forget nothing.</span>
            <Squiggle className="absolute -bottom-2 left-0 w-full text-tomato" />
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-lg text-muted">
          Tell Bagsy where you're going, when, and what you'll get up to. It builds your packing list from the weather on
          those dates, for you or your whole group.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="tomato" size="lg" onClick={() => navigate(token ? '/create-trip' : '/signup')}>
            Make my packing list
          </Button>
          {!token && (
            <Button variant="paper" size="lg" onClick={() => navigate('/login')}>
              I have an account
            </Button>
          )}
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ title, icon, tint, text }) => (
          <article key={title} className="lift flex flex-col gap-4 rounded-2xl border border-ink bg-card p-6 shadow-pop">
            <IconBadge icon={icon} tint={tint} />
            <h2 className="font-display text-2xl">{title}</h2>
            <p className="text-sm text-muted">{text}</p>
          </article>
        ))}
      </section>
    </Layout>
  );
}
