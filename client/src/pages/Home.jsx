import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Hero from '../components/landing/Hero';
import PackDemo from '../components/landing/PackDemo';
import SorterDemo from '../components/landing/SorterDemo';
import CrewInspo from '../components/landing/CrewInspo';
import PackGame from '../components/landing/PackGame';

const MARQUEE = ['passport', 'sunscreen spf 50', 'type c cable', 'kurta for the sangeet', 'the good sunglasses', 'aadhaar card', 'swimsuit', 'that one charger', 'rain jacket', 'snacks for the flight'];

function Section({ id, n, title, accent, blurb, children }) {
  return (
    <section id={id} className="scroll-mt-24 py-14">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-black text-card">{n}</span>
          <h2 className="lp-display mt-2 text-[clamp(40px,6vw,72px)]">
            {title} <span className="font-accent text-tomato">{accent}</span>
          </h2>
        </div>
        <p className="max-w-[24em] text-sm text-muted">{blurb}</p>
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const getStarted = () => navigate(token ? '/create-trip' : '/signup');

  return (
    <Layout wide>
      <Hero onStart={getStarted} />

      {/* full-width ticker that breaks out of the page column */}
      <div aria-hidden="true" className="relative left-1/2 my-4 w-screen -translate-x-1/2 -rotate-[1.5deg] overflow-hidden border-y-2 border-ink bg-tomato py-4 text-card">
        <div className="lp-marquee-track lp-display text-2xl uppercase">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <Section id="demo" n="1" title="Your list," accent="in one tap." blurb="Pick a trip. Bagsy checks the weather for those dates and builds the list. Tick everything off and see what happens.">
        <PackDemo />
      </Section>

      <Section id="sorter" n="2" title="It knows" accent="where things go." blurb="Type anything you'd pack. A small model trained on 466 items sorts it as you type. When it isn't sure, it says so.">
        <SorterDemo />
      </Section>

      <Section n="3" title="Bring" accent="the whole crew." blurb="Share one link. Everyone gets their own list, the admin sees who's behind, and the inspo board keeps every reel idea in one place.">
        <CrewInspo />
      </Section>

      <Section id="play" n="4" title="Or just" accent="pack the bag." blurb="30 seconds. Catch what the trip needs, dodge what it doesn't. Move with your mouse, finger or arrow keys.">
        <PackGame onSignup={getStarted} />
      </Section>

      <section className="my-10 rounded-[28px] bg-ink px-6 py-14 text-center text-card">
        <p className="eyebrow !text-sun">Bagsy (verb): to call dibs</p>
        <h2 className="lp-display mb-7 mt-3 text-[clamp(44px,8vw,100px)]">
          Bagsy the <span className="font-accent text-sun-deep">window seat.</span>
          <br />
          We'll pack the rest.
        </h2>
        <button
          type="button"
          onClick={getStarted}
          className="btn inline-flex items-center gap-2 rounded-full border border-card bg-tomato px-7 py-3.5 font-extrabold text-card shadow-[4px_4px_0_#E5532D] hover:bg-card hover:text-ink"
        >
          {token ? 'Plan a new trip' : 'Make my packing list'} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>
    </Layout>
  );
}
