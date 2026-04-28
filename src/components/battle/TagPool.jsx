// ============================================================
//  TagPool — Active buff/debuff tags
//  Used for both player (full) and enemy (compact).
//  Same layout code runs for both — only sizes differ.
// ============================================================

import { ui_registry, UI_DEFAULT } from '../../battle/registry/ui_registry';
import { STATUS_DEFAULT as DEFAULT_ICON } from '../../assets';

const FULL_SZ = {
  tile:         'calc((24rem - 7 * 0.375rem) / 8)',
  stackFont:    '16px',
  barWidth:     '12rem',
  barMinHeight: '2.5rem',
  barIconWidth: '2.5rem',
  barFont:      '13px',
  gap:          'gap-1.5',
  barMargin:    '16px',
};

const COMPACT_SZ = {
  tile:         '2.35rem',
  stackFont:    '16px',
  barWidth:     '9.5rem',
  barMinHeight: '2.1rem',
  barIconWidth: '2.1rem',
  barFont:      '11px',
  gap:          'gap-1',
  barMargin:    '10px',
};

// ── Icon-only square tile (condition tier) ───────────────────
function IconTag({ icon, color, stacks, name, duration, tooltip, sz }) {
  return (
    <div
      className="group relative flex flex-row items-center overflow-visible"
      style={{ height: sz.tile }}
    >
      <div
        className="flex-shrink-0 relative flex items-center justify-center"
        style={{
          width: sz.tile,
          height: sz.tile,
          background: '#09090f',
          border: `1px solid ${color}`,
          borderRadius: '3px',
          boxShadow: `0 0 8px ${color}55, inset 0 0 4px ${color}11`,
        }}
      >
        <img src={icon} alt={name} className="w-full h-full object-contain" style={{ borderRadius: '2px' }} />
        <span
          className="absolute bottom-0 right-0 text-white font-mono leading-none"
          style={{ fontSize: sz.stackFont, textShadow: '0 0 3px #000, 0 0 3px #000', padding: '1px 2px' }}
        >
          {stacks}
        </span>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0
            w-60 rounded-lg border border-gray-600 shadow-xl z-[100]
            opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: '#1a1a2e' }}
        >
          <div className="h-1 rounded-t-lg" style={{ background: color }} />
          <div className="px-3 py-2.5 flex flex-col gap-1.5">
            <div className="text-[13px] font-bold font-body" style={{ color }}>{name}</div>
            <div className="text-[12px] text-gray-300 font-mono leading-tight">{tooltip}</div>
            {duration && <div className="text-[11px] text-[#ffd700] font-mono">{duration} turns remaining</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bar-style tile (advanced tier) ───────────────────────────
function BarTag({ icon, color, stacks, name, duration, tooltip, sz }) {
  return (
    <div
      className="group relative flex flex-row items-center overflow-visible"
      style={{
        width: sz.barWidth,
        minHeight: sz.barMinHeight,
        background: '#09090f',
        border: `2px solid ${color}`,
        borderRadius: '3px',
        boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}11`,
      }}
    >
      {/* Left — icon */}
      <div
        className="flex-shrink-0 self-stretch flex items-center justify-center"
        style={{ width: sz.barIconWidth, borderRight: `1px solid ${color}` }}
      >
        <img src={icon} alt={name} className="w-full h-full object-contain" style={{ borderRadius: '2px' }} />
      </div>

      {/* Right — stack + name + duration */}
      <div className="flex flex-row items-center justify-between min-w-0 flex-1 self-stretch py-1">
        <>
          <span className="flex-shrink-0 text-white font-mono mx-2 self-center" style={{ fontSize: sz.barFont }}>x{stacks}</span>
          <div className="flex-shrink-0 self-stretch w-px ml-0.5 mr-1.5" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </>
        <div
          className="font-bold tracking-wide font-body leading-tight flex-1 min-w-0 flex items-center"
          style={{ color, fontSize: sz.barFont }}
        >
          <span className="break-words">{name}</span>
        </div>
        {duration && (
          <span className="flex-shrink-0 text-[#ffd700] font-mono ml-1 self-center" style={{ fontSize: sz.barFont }}>{duration}⏳</span>
        )}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0
            w-60 rounded-lg border border-gray-600 shadow-xl z-[100]
            opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: '#1a1a2e' }}
        >
          <div className="h-1 rounded-t-lg" style={{ background: color }} />
          <div className="px-3 py-2.5 flex flex-col gap-1.5">
            <div className="text-[13px] font-bold font-body" style={{ color }}>{name}</div>
            <div className="text-[12px] text-gray-300 font-mono leading-tight">{tooltip}</div>
            {duration && <div className="text-[11px] text-[#ffd700] font-mono">{duration} turns remaining</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TagPool({ tags, compact, growRight }) {
  const sz = compact ? COMPACT_SZ : FULL_SZ;

  const advancedTags  = tags.filter(t => t.tier === 'advanced');
  const conditionTags = tags.filter(t => t.tier === 'condition');

  // Chunk condition tags into columns of 7, newest rightmost
  const columns = [];
  for (let i = 0; i < conditionTags.length; i += 7) columns.push(conditionTags.slice(i, i + 7));
  if (columns.length === 0) columns.push([]);

  const advancedColumn = advancedTags.length > 0 ? (
    <div className={`flex flex-col-reverse ${sz.gap}`}>
      {advancedTags.map((tag, i) => {
        const display = ui_registry[tag.tag_name] || UI_DEFAULT;
        const stacks = tag.stacks ?? tag.stack_count ?? 1;
        const description = display.describe(tag);
        return (
          <BarTag
            key={i}
            sz={sz}
            icon={display.statusIcon ?? DEFAULT_ICON}
            color={display.color}
            stacks={stacks}
            name={tag.tag_name.replace(/_/g, ' ')}
            duration={tag.duration}
            tooltip={description && description !== 'active' ? description : null}
          />
        );
      })}
    </div>
  ) : null;

  return (
    <div className={`flex ${growRight ? 'flex-row' : 'flex-row-reverse'} ${sz.gap}`}>
      {columns.map((col, ci) => (
        <div key={ci} className={`flex flex-col-reverse ${sz.gap}`}>
          {Array.from({ length: 7 }).map((_, si) => {
            const tag = col[si];
            if (!tag) return <div key={si} style={{ width: sz.tile, height: sz.tile, flexShrink: 0 }} />;
            const display = ui_registry[tag.tag_name] || UI_DEFAULT;
            const description = display.describe(tag);
            const stacks = tag.stacks ?? tag.stack_count ?? 1;
            return (
              <IconTag
                key={si}
                sz={sz}
                icon={display.statusIcon ?? DEFAULT_ICON}
                color={display.color}
                stacks={stacks}
                name={tag.tag_name.replace(/_/g, ' ')}
                duration={tag.duration}
                tooltip={description && description !== 'active' ? description : null}
              />
            );
          })}
        </div>
      ))}
      {/* Advanced tier — leftmost */}
      {advancedColumn}
    </div>
  );
}
