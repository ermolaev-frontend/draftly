// Utility functions for canvas shape processing

export function catmullRom2bezier(
  points: { x: number; y: number }[],
): Array<{
  start: { x: number; y: number };
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  end: { x: number; y: number };
}> {
  if (points.length < 2) return [];
  const beziers = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1] || points[i];
    const p3 = points[i + 2] || p2;

    // Catmull-Rom to Bezier conversion
    const cp1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };

    const cp2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };

    beziers.push({
      start: { x: p1.x, y: p1.y },
      cp1,
      cp2,
      end: { x: p2.x, y: p2.y },
    });
  }

  return beziers;
}

export function simplifyDouglasPeucker(
  points: { x: number; y: number }[],
  epsilon: number,
): { x: number; y: number }[] {
  if (points.length < 3) return points;
  const dmax = { dist: 0, idx: 0 };

  const sq = (
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) => (
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2
  );

  function getPerpendicularDistance(
    pt: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number },
  ): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    if (dx === 0 && dy === 0) return Math.sqrt(sq(pt, lineStart));

    const t =
      ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) /
      (dx * dx + dy * dy);

    const proj = {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy,
    };

    return Math.sqrt(sq(pt, proj));
  }

  for (let i = 1; i < points.length - 1; i++) {
    const d = getPerpendicularDistance(points[i], points[0], points[points.length - 1]);

    if (d > dmax.dist) {
      dmax.dist = d;
      dmax.idx = i;
    }
  }

  if (dmax.dist > epsilon) {
    const rec1 = simplifyDouglasPeucker(points.slice(0, dmax.idx + 1), epsilon);
    const rec2 = simplifyDouglasPeucker(points.slice(dmax.idx), epsilon);

    return rec1.slice(0, -1).concat(rec2);
  } else {
    return [points[0], points[points.length - 1]];
  }
} 
