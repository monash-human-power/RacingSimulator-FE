interface Point {
  x: number;
  y: number;
}

function pathFromPoints(points: Point[], width: number, height: number) {
  if (!points.length) return "";
  const maxX = Math.max(...points.map((p) => p.x), 1);
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y), minY + 1);

  return points
    .map((point, i) => {
      const px = (point.x / maxX) * width;
      const py = height - ((point.y - minY) / (maxY - minY)) * height;
      return `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(" ");
}

export function LineChart({
  points,
  color,
  label,
}: {
  points: Point[];
  color: string;
  label: string;
}) {
  const width = 760;
  const height = 220;
  const d = pathFromPoints(points, width, height);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-sm text-slate-300">{label}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <defs>
          <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <path d={d} stroke={color} fill="none" strokeWidth="3" strokeLinecap="round" />
        <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill={`url(#gradient-${label})`} />
      </svg>
    </div>
  );
}
