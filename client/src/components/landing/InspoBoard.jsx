import { useRef, useState } from 'react';
import { Lock, Play, RotateCcw, Users } from 'lucide-react';
import { Folder, Fort, GrainFilter, Outfit, Plain, Sunset, Thali } from './BoardArt';

// Want a real photo instead of a drawing? Put the file in client/public/inspo/
// and set `img` on that item, e.g. img: '/inspo/sunset.jpg'. Leave it out to keep the drawing.
const ITEMS = [
  { id: 'sunset', kind: 'photo', who: 'group', name: 'sunset_crew.jpg', art: Sunset, img: '/inspo/beach.jpg', x: 20, y: 22, r: -5, w: 19, label: 'a photo idea' },
  { id: 'group', kind: 'folder', who: 'group', name: 'Group board', x: 51, y: 15, r: 0, w: 12, label: 'shared with Priya, Mum and Arjun' },
  { id: 'fort', kind: 'photo', who: 'group', name: 'trip_journal.jpg', art: Fort, img: '/inspo/lists.jpg', x: 81, y: 24, r: 4, w: 19, label: 'a scrapbook idea' },
  { id: 'me', kind: 'folder', who: 'me', name: 'Just me', x: 12, y: 55, r: -3, w: 12, label: 'only you can see it' },
  { id: 'fits', kind: 'stack', who: 'me', name: 'passport_pic', art: Outfit, img: '/inspo/passports.jpg', x: 28, y: 81, r: -3, w: 17, label: 'a photo idea' },
  { id: 'thali', kind: 'photo', who: 'group', name: 'fish_thali.jpg', art: Thali, img: null, square: true, x: 62, y: 83, r: -4, w: 17, label: 'a food spot' },
  { id: 'note', kind: 'note', who: 'me', name: 'matching sunnies for the group pic??', x: 85, y: 69, r: 5, w: 18, label: 'a note' },
];

const CREW = [
  ['P', '#DCE6FB'],
  ['M', '#E7F2C4'],
  ['A', '#FADACB'],
];

function Picture({ item }) {
  const Art = item.art;
  return (
    <span className="lp-b-pic">
      {item.img ? (
        <img src={item.img} alt="" draggable="false" className={item.square ? 'aspect-square' : 'aspect-[4/5]'} />
      ) : (
        <Art />
      )}
      {item.reel && (
        <>
          <span className="lp-b-play">
            <Play size={8} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="lp-b-dur">{item.reel}</span>
        </>
      )}
    </span>
  );
}

function Thing({ item }) {
  if (item.kind === 'photo') return <Picture item={item} />;
  if (item.kind === 'stack') {
    return (
      <span className="lp-b-stack">
        <span className="lp-b-pic">
          <Plain fill="#F3DCD3" />
        </span>
        <span className="lp-b-pic">
          <Plain fill="#E4ECCB" />
        </span>
        <Picture item={item} />
      </span>
    );
  }
  if (item.kind === 'note') {
    return (
      <span className="lp-b-note">
        <span className="font-accent block">{item.name}</span>
        <small>Note to self</small>
      </span>
    );
  }
  const mine = item.who === 'me';
  return (
    <>
      <span className="lp-b-folder">
        <Folder tab={mine ? '#DDB3EA' : '#A9BCEB'} body={mine ? '#ECD3F3' : '#C8D5F4'} />
        {mine && (
          <span className="lp-b-lock">
            <Lock size={9} strokeWidth={2.4} aria-hidden="true" />
          </span>
        )}
      </span>
      {!mine && (
        <span className="lp-b-who" aria-hidden="true">
          {CREW.map(([initial, bg]) => (
            <i key={initial} style={{ background: bg }}>
              {initial}
            </i>
          ))}
        </span>
      )}
    </>
  );
}

// A little desktop of inspo: drag things around, filter by who can see them
export default function InspoBoard() {
  const canvas = useRef(null);
  const drag = useRef(null);
  const [offsets, setOffsets] = useState({});
  const [order, setOrder] = useState({});
  const [filter, setFilter] = useState('all');
  const [tidying, setTidying] = useState(false);
  const [dragging, setDragging] = useState(null);

  const raise = (id) => setOrder((o) => ({ ...o, [id]: Math.max(10, ...Object.values(o)) + 1 }));
  const move = (id, x, y) => setOffsets((o) => ({ ...o, [id]: { x, y } }));

  const onDown = (e, id) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    const start = offsets[id] || { x: 0, y: 0 };
    drag.current = { id, sx: e.clientX, sy: e.clientY, ox: start.x, oy: start.y, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    setTidying(false);
    setDragging(id);
    raise(id);
  };

  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const c = canvas.current.getBoundingClientRect();
    // keep the item's centre inside the board
    const mx = Math.min(Math.max(e.clientX - d.sx, c.left + 10 - d.cx), c.right - 10 - d.cx);
    const my = Math.min(Math.max(e.clientY - d.sy, c.top + 10 - d.cy), c.bottom - 10 - d.cy);
    move(d.id, d.ox + mx, d.oy + my);
  };

  const onUp = () => {
    drag.current = null;
    setDragging(null);
  };

  const onKey = (e, id) => {
    const step = e.shiftKey ? 30 : 10;
    const k = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!k) return;
    e.preventDefault();
    const o = offsets[id] || { x: 0, y: 0 };
    raise(id);
    move(id, o.x + k[0], o.y + k[1]);
  };

  const tidy = () => {
    setTidying(true);
    setOffsets({});
  };

  const FILTERS = [
    ['all', 'All', null],
    ['group', 'Group', Users],
    ['me', 'Just me', Lock],
  ];

  return (
    <div className="lp-board rounded-[22px] border border-ink shadow-pop">
      <div className="lp-b-top">
        <span className="lp-b-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="lp-b-seg" role="group" aria-label="Show">
          {FILTERS.map(([key, text, Icon]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {Icon && <Icon size={12} aria-hidden="true" />}
              {text}
            </button>
          ))}
        </div>
      </div>

      <div ref={canvas} className="lp-b-canvas">
        <GrainFilter />
        <div className="lp-b-title" aria-hidden="true">
          <span className="lp-display block">Goa</span>
          <span className="lp-b-sel">
            <span className="font-accent">inspo</span>
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'k'].map((h) => (
              <i key={h} className={`h ${h}`} />
            ))}
            <svg className="lp-b-cursor" viewBox="0 0 22 26">
              <path d="M2 2 L2 21 L7 16.5 L10.5 24 L14 22.5 L10.6 15 L17.5 15 Z" fill="#FFFCF7" stroke="#14100B" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {ITEMS.map((item) => {
          const o = offsets[item.id] || { x: 0, y: 0 };
          const dim = filter !== 'all' && item.who !== filter;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={`${item.name}, ${item.label}`}
              tabIndex={dim ? -1 : 0}
              className={`lp-b-it lp-b-k-${item.kind} ${dragging === item.id ? 'dragging' : ''} ${tidying ? 'tidy' : ''} ${dim ? 'dim' : ''}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.w}%`,
                zIndex: order[item.id] || 2,
                transform: `translate(-50%,-50%) translate(${o.x}px,${o.y}px) rotate(${item.r}deg)`,
              }}
              onPointerDown={(e) => onDown(e, item.id)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={(e) => onKey(e, item.id)}
            >
              <Thing item={item} />
              {item.kind !== 'note' && <span className="lp-b-name">{item.name}</span>}
            </button>
          );
        })}
      </div>

      <div className="lp-b-foot">
        <span>Drag anything around. It's your board.</span>
        <button type="button" onClick={tidy}>
          <RotateCcw size={12} aria-hidden="true" /> Tidy up
        </button>
      </div>
    </div>
  );
}
