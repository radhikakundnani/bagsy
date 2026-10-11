import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Crown, Eye, RefreshCw, UserMinus, UserPlus, UsersRound } from 'lucide-react';
import { Button, Card, ProgressBar } from './ui';
import API from '../api/axios';

// Who's on a group trip, how packed everyone is, and the invite link.
// Admins can open anyone's list, remove people and make a new link.
export default function CrewPanel({ trip, onTripChange, showToast }) {
  const navigate = useNavigate();
  const isAdmin = trip.myRole === 'admin';
  const [crew, setCrew] = useState([]);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const loadCrew = () =>
    API.get(`/trips/${trip._id}/crew`)
      .then((res) => setCrew(res.data.data))
      .catch(() => setCrew([]));

  useEffect(() => {
    if (trip.mode === 'group') loadCrew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip._id, trip.mode]);

  const inviteUrl = trip.inviteCode ? `${window.location.origin}/join/${trip.inviteCode}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Copy failed. Select the link and copy it yourself.', 'error');
    }
  };

  // Also used to turn a solo trip into a group trip
  const newLink = async () => {
    setBusy(true);
    try {
      const res = await API.post(`/trips/${trip._id}/invite`);
      onTripChange({ ...trip, mode: 'group', inviteCode: res.data.data.inviteCode });
      showToast(trip.mode === 'group' ? 'New link made. The old one no longer works.' : 'Invite link ready');
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't make a link.", 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (person) => {
    setBusy(true);
    try {
      await API.delete(`/trips/${trip._id}/members/${person._id}`);
      if (person.isMe) {
        navigate('/dashboard');
        return;
      }
      setConfirmRemove(null);
      showToast(`${person.name} was removed`);
      loadCrew();
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't do that.", 'error');
    } finally {
      setBusy(false);
    }
  };

  // Solo trip: admins can turn it into a group trip
  if (trip.mode !== 'group') {
    if (!isAdmin) return null;
    return (
      <Card shadow={false} className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="eyebrow">Travelling with others?</p>
          <p className="mt-1 text-sm text-muted">Turn this into a group trip and invite people with a link.</p>
        </div>
        <Button variant="paper" onClick={newLink} disabled={busy}>
          <UserPlus size={16} strokeWidth={2.2} aria-hidden="true" /> Invite people
        </Button>
      </Card>
    );
  }

  return (
    <Card shadow={false}>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <UsersRound size={14} strokeWidth={2.2} aria-hidden="true" /> The crew · {crew.length || trip.memberCount}
        </p>
      </div>

      {isAdmin && inviteUrl && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border-2 border-ink bg-sun p-4">
          <label htmlFor="invite-link" className="text-sm font-bold">
            Invite link
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="invite-link"
              readOnly
              value={inviteUrl}
              onFocus={(e) => e.target.select()}
              className="smooth w-full min-w-0 rounded-xl border-2 border-ink bg-card px-3 py-2 text-sm sm:flex-1"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={copyLink}>
                {copied ? <Check size={16} strokeWidth={2.6} aria-hidden="true" /> : <Copy size={16} strokeWidth={2.2} aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="paper" size="sm" onClick={newLink} disabled={busy} title="Make a new link and turn off the old one">
                <RefreshCw size={16} strokeWidth={2.2} aria-hidden="true" /> New link
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted">Anyone with this link can join and gets their own packing list.</p>
        </div>
      )}

      <ul className="mt-4 flex flex-col">
        {crew.map((person) => (
          <li key={person._id} className="flex flex-col gap-3 border-b border-ink/25 py-4 last:border-b-0 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lilac font-bold" aria-hidden="true">
                {person.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-bold">
                  {person.name}
                  {person.isMe && <span className="font-normal text-muted">(you)</span>}
                  {person.role === 'admin' && <Crown size={14} strokeWidth={2.4} className="text-sun-deep" aria-label="Admin" />}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <ProgressBar packed={person.progress.packed} total={person.progress.total} className="h-2 flex-1" label={`${person.name}'s progress`} />
                  <span className="w-16 shrink-0 text-right text-xs text-muted tabular-nums">
                    {person.progress.packed}/{person.progress.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              {confirmRemove === person._id ? (
                <>
                  <Button variant="tomato" size="sm" onClick={() => remove(person)} disabled={busy}>
                    {person.isMe ? 'Yes, leave' : 'Yes, remove'}
                  </Button>
                  <Button variant="paper" size="sm" onClick={() => setConfirmRemove(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {isAdmin && !person.isMe && (
                    <Button variant="paper" size="sm" onClick={() => navigate(`/trips/${trip._id}/packing?member=${person._id}`)}>
                      <Eye size={16} strokeWidth={2.2} aria-hidden="true" /> View list
                    </Button>
                  )}
                  {person.role !== 'admin' && (isAdmin || person.isMe) && (
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(person._id)}
                      className="smooth inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-muted hover:bg-peach hover:text-ink"
                    >
                      <UserMinus size={16} strokeWidth={2.2} aria-hidden="true" />
                      {person.isMe ? 'Leave' : 'Remove'}
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
