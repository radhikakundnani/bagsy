import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CircleHelp, Eye, LoaderCircle, Plus, Sparkles, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import SuggestionsPanel from '../components/SuggestionsPanel';
import { Alert, Button, ProgressBar, Spinner, Title, Toast, inputClass } from '../components/ui';
import { CATEGORIES, CATEGORY_ORDER } from '../utils/tripMeta';
import API from '../api/axios';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To pack' },
  { value: 'done', label: 'Packed' },
];

function groupByCategory(items) {
  return items.reduce((groups, item) => {
    const cat = CATEGORIES[item.category] ? item.category : 'misc';
    (groups[cat] = groups[cat] || []).push(item);
    return groups;
  }, {});
}

export default function PackingList() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('member'); // set when an admin views someone else's list

  const [packingList, setPackingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [justTicked, setJustTicked] = useState(null);
  const [brief, setBrief] = useState('');

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('misc');
  const [adding, setAdding] = useState(false);
  // Item sorter (ML): picks a category as you type, unless you've picked one yourself
  const [sorted, setSorted] = useState(null); // { category, confidence, confident } or null
  const [sorting, setSorting] = useState(false);
  const [pickedByHand, setPickedByHand] = useState(false);
  const latestSort = useRef(0);

  useEffect(() => {
    setLoading(true);
    API.get(`/packing/${id}`, { params: memberId ? { member: memberId } : {} })
      .then((res) => {
        setPackingList(res.data.data);
        setBrief(res.data.data.brief || '');
      })
      .catch((err) => setError(err.response?.data?.message || "We couldn't load this packing list."))
      .finally(() => setLoading(false));
  }, [id, memberId]);

  const readOnly = Boolean(packingList?.readOnly);

  // Ask the item sorter for a category a moment after you stop typing
  useEffect(() => {
    const text = newItemName.trim();
    if (pickedByHand || text.length < 3) {
      setSorted(null);
      setSorting(false);
      return undefined;
    }
    setSorting(true);
    const requestId = ++latestSort.current;
    const timer = setTimeout(async () => {
      try {
        const res = await API.get('/packing/sort-item', { params: { name: text } });
        if (requestId !== latestSort.current) return; // you kept typing; a newer answer is coming
        const result = res.data.data;
        setSorted(result);
        if (result) setNewItemCategory(result.category);
      } catch {
        if (requestId === latestSort.current) setSorted(null); // no sorter, no problem: you pick
      } finally {
        if (requestId === latestSort.current) setSorting(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [newItemName, pickedByHand]);

  const resetAddForm = () => {
    setNewItemName('');
    setNewItemCategory('misc');
    setPickedByHand(false);
    setSorted(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const toggleItem = async (itemId) => {
    if (readOnly) return;
    const item = packingList.items.find((i) => i._id === itemId);
    if (!item) return;

    // Update the screen straight away, then tell the server
    setJustTicked(item.isPacked ? null : itemId);
    setPackingList((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i._id === itemId ? { ...i, isPacked: !i.isPacked } : i)),
    }));

    try {
      await API.put(`/packing/${id}/item/${itemId}`, { isPacked: !item.isPacked });
    } catch {
      // Put it back if the server said no
      setPackingList((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i._id === itemId ? { ...i, isPacked: item.isPacked } : i)),
      }));
      showToast("Couldn't save that. Try again.", 'error');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setAdding(true);
    try {
      const res = await API.post(`/packing/${id}/item`, { name: newItemName.trim(), category: newItemCategory });
      setPackingList(res.data.data);
      resetAddForm();
      showToast('Added to your list');
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't add that item.", 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    try {
      const res = await API.delete(`/packing/${id}/item/${itemId}`);
      setPackingList(res.data.data);
      showToast(`Removed “${itemName}”`);
    } catch {
      showToast("Couldn't remove that item.", 'error');
    }
  };

  if (loading) {
    return (
      <Layout wide>
        <Spinner label="Loading packing list" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout wide>
        <Alert>{error}</Alert>
      </Layout>
    );
  }

  const items = packingList?.items || [];
  const grouped = groupByCategory(items);
  const packedCount = items.filter((i) => i.isPacked).length;
  const categories = CATEGORY_ORDER.filter((c) => grouped[c]);
  const visible = (item) => filter === 'all' || (filter === 'done') === item.isPacked;
  const ownerFirstName = packingList.ownerName?.split(' ')[0];

  return (
    <Layout wide>
      <Toast toast={toast} />

      <Link to={`/trips/${id}`} className="smooth inline-flex items-center gap-1 text-sm font-bold underline decoration-2 underline-offset-4 hover:text-tomato">
        <ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" /> Back to trip
      </Link>

      <div className="mt-6">
        {readOnly ? <Title accent="list">{`${ownerFirstName}'s`}</Title> : <Title accent="list">Packing</Title>}
      </div>

      {readOnly && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-ink bg-sky px-4 py-3 text-sm font-medium">
          <Eye size={18} strokeWidth={2.2} aria-hidden="true" />
          You're viewing {ownerFirstName}'s list as the trip admin. Only they can tick things off.
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        {/* Summary that stays in view */}
        <aside className="flex flex-col gap-6 rounded-2xl border border-ink bg-card p-6 shadow-pop lg:sticky lg:top-24">
          <div>
            <p className="eyebrow">Progress</p>
            <p className="font-display mt-2 text-4xl tabular-nums">
              {packedCount}
              <span className="text-muted">/{items.length}</span>
            </p>
            <ProgressBar packed={packedCount} total={items.length} className="mt-3 h-3" />
            {items.length > 0 && packedCount === items.length && <p className="mt-2 text-sm font-bold">All packed. Have a great trip!</p>}
          </div>

          <div>
            <p className="eyebrow">Show</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter items">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={`smooth rounded-full border border-ink px-3 py-1 text-sm font-bold ${filter === f.value ? 'bg-ink text-card' : 'bg-card hover:bg-sun'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <nav aria-label="Jump to category" className="hidden lg:block">
            <p className="eyebrow">Jump to</p>
            <ul className="mt-2 flex flex-col">
              {!readOnly && (
            <SuggestionsPanel tripId={id} packingList={packingList} brief={brief} onListChange={setPackingList} showToast={showToast} />
          )}

          {categories.map((cat) => {
                const { label, icon: Icon } = CATEGORIES[cat];
                return (
                  <li key={cat}>
                    <a href={`#cat-${cat}`} className="smooth flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-sun">
                      <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="flex flex-col gap-6">
          {!readOnly && (
            <form onSubmit={handleAddItem} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label htmlFor="pl-new" className="sr-only">
                Item name
              </label>
              <input
                id="pl-new"
                type="text"
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value);
                  if (!e.target.value.trim()) setPickedByHand(false);
                }}
                placeholder="Add something only you would remember…"
                className={`${inputClass} sm:flex-1`}
              />
              <label htmlFor="pl-cat" className="sr-only">
                Category
              </label>
              <select
                id="pl-cat"
                value={newItemCategory}
                onChange={(e) => {
                  setNewItemCategory(e.target.value);
                  setPickedByHand(true);
                }}
                className={`${inputClass.replace('bg-card', !pickedByHand && sorted ? (sorted.confident ? 'bg-lime' : 'bg-sun') : 'bg-card')} sm:w-52`}
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIES[c].label}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={adding || !newItemName.trim()}>
                <Plus size={16} strokeWidth={2.6} aria-hidden="true" /> Add
              </Button>
              <SortHint
                sorting={sorting}
                sorted={sorted}
                pickedByHand={pickedByHand}
                category={newItemCategory}
                onLetBagsySort={() => setPickedByHand(false)}
              />
            </form>
          )}

          {categories.map((cat) => {
            const { label, icon: Icon, tint } = CATEGORIES[cat];
            const list = grouped[cat];
            const shown = list.filter(visible);
            if (shown.length === 0) return null;
            const packed = list.filter((i) => i.isPacked).length;
            return (
              <section key={cat} id={`cat-${cat}`} className="scroll-mt-24 overflow-hidden rounded-2xl border border-ink bg-card">
                <h2 className={`flex items-center justify-between gap-3 border-b border-ink px-6 py-3 ${tint}`}>
                  <span className="font-display inline-flex items-center gap-2 text-lg">
                    <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                    {label}
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {packed}/{list.length}
                  </span>
                </h2>
                <ul>
                  {shown.map((item) => (
                    <li key={item._id} className="smooth group flex items-center gap-3 border-b border-ink/25 px-6 py-3 last:border-b-0 hover:bg-paper">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={item.isPacked}
                        aria-label={`${item.isPacked ? 'Unpack' : 'Pack'} ${item.name}`}
                        onClick={() => toggleItem(item._id)}
                        disabled={readOnly}
                        className={`smooth flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-ink disabled:cursor-default ${
                          item.isPacked ? 'bg-ink text-card' : 'bg-card enabled:hover:bg-sun'
                        } ${justTicked === item._id ? 'animate-tick' : ''}`}
                      >
                        {item.isPacked && <Check size={16} strokeWidth={3} aria-hidden="true" />}
                      </button>
                      <span className={`flex-1 ${item.isPacked ? 'text-muted line-through' : ''}`}>{item.name}</span>
                      {item.isSuggested && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-ink bg-lilac px-2 py-0.5 text-[11px] font-bold">
                          <Sparkles size={11} strokeWidth={2.6} aria-hidden="true" /> suggested
                        </span>
                      )}
                      {item.isCustom && <span className="rounded-full border border-ink px-2 py-0.5 text-[11px] font-bold">added</span>}
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item._id, item.name)}
                          className="smooth rounded-full p-1.5 text-muted hover:bg-peach hover:text-ink md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {items.length === 0 && <p className="text-center text-muted">This list is empty.</p>}
          {items.length > 0 && filter !== 'all' && items.filter(visible).length === 0 && (
            <p className="rounded-2xl border border-dashed border-ink p-6 text-center text-muted">
              {filter === 'done' ? 'Nothing packed yet.' : 'Everything’s packed!'}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

// The line under the add box: what the item sorter decided, and how sure it is
function SortHint({ sorting, sorted, pickedByHand, category, onLetBagsySort }) {
  const label = <b className="text-ink">{CATEGORIES[category]?.label || category}</b>;
  let icon = null;
  let text = null;
  if (pickedByHand) {
    icon = <Check size={15} aria-hidden="true" />;
    text = (
      <>
        You picked {label}.{' '}
        <button type="button" onClick={onLetBagsySort} className="font-bold text-ink underline underline-offset-4">
          Let Bagsy sort it
        </button>
      </>
    );
  } else if (sorting) {
    icon = <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />;
    text = 'Sorting…';
  } else if (sorted?.confident) {
    icon = <Sparkles size={15} aria-hidden="true" />;
    text = (
      <>
        Sorted into {label} · {Math.round(sorted.confidence * 100)}% sure
      </>
    );
  } else if (sorted) {
    icon = <CircleHelp size={15} aria-hidden="true" />;
    text = <>Not sure. {label}? Change it if that's wrong.</>;
  }
  return (
    <p className="flex min-h-5 basis-full items-center gap-1.5 text-sm text-muted" aria-live="polite">
      {icon}
      {text && <span>{text}</span>}
    </p>
  );
}
