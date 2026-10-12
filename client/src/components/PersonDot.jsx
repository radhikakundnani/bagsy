import { tintFor } from '../utils/sections';

// Small round initial for "who added this"
export default function PersonDot({ person, size = 'sm' }) {
  const sizes = { sm: 'h-6 w-6 text-[10px]', md: 'h-9 w-9 text-sm' };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-ink font-bold ${sizes[size]} ${tintFor(person?._id)}`}
      title={person?.name}
      aria-hidden="true"
    >
      {(person?.name || '?').trim()[0]?.toUpperCase()}
    </span>
  );
}
