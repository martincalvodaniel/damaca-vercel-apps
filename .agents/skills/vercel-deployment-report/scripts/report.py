"""Count Vercel deployments created in a fixed rolling time window."""
import argparse
import collections
import datetime as dt
import json
import subprocess
from zoneinfo import ZoneInfo


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scope', default='martincalvodaniels-projects')
    parser.add_argument('--hours', type=int, default=24)
    parser.add_argument('--end', help='ISO 8601 window end with timezone; defaults to now')
    args = parser.parse_args()
    if args.hours <= 0:
        parser.error('--hours must be positive')
    end = dt.datetime.fromisoformat(args.end.replace('Z', '+00:00')) if args.end else dt.datetime.now(dt.timezone.utc)
    if end.tzinfo is None:
        parser.error('--end must include a timezone')
    end_ms = int(end.timestamp() * 1000)
    start_ms = end_ms - args.hours * 3600000
    cursor = None
    cursors = set()
    rows = {}
    pages = 0
    while True:
        command = ['vercel', 'list', '--all', '--scope', args.scope, '--json', '--limit', '100']
        if cursor is not None:
            command += ['--next', str(cursor)]
        result = subprocess.run(command, capture_output=True, text=True, timeout=120)
        if result.returncode:
            raise RuntimeError(result.stderr.strip() or 'Vercel CLI failed')
        page = json.loads(result.stdout)
        deployments = page['deployments']
        pages += 1
        for row in deployments:
            created = row['createdAt']
            if start_ms <= created < end_ms:
                key = row.get('uid') or row.get('id') or row['url']
                rows[key] = row
        next_cursor = page.get('pagination', {}).get('next')
        if not deployments or min(row['createdAt'] for row in deployments) < start_ms or next_cursor is None:
            break
        if next_cursor in cursors:
            raise RuntimeError('Pagination cursor repeated; refusing an incomplete report')
        cursors.add(next_cursor)
        cursor = next_cursor
    states = collections.Counter()
    projects = collections.defaultdict(collections.Counter)
    for row in rows.values():
        state = row.get('state') or row.get('readyState') or 'UNKNOWN'
        states[state] += 1
        projects[row['name']][state] += 1
    def timestamp(value):
        return dt.datetime.fromtimestamp(value / 1000, dt.timezone.utc).isoformat()
    report = {
        'scope': args.scope,
        'window': {'startInclusive': timestamp(start_ms), 'endExclusive': timestamp(end_ms),
                   'startMadrid': dt.datetime.fromtimestamp(start_ms / 1000, ZoneInfo('Europe/Madrid')).isoformat(),
                   'endMadrid': end.astimezone(ZoneInfo('Europe/Madrid')).isoformat()},
        'pagesRead': pages, 'total': len(rows), 'states': dict(sorted(states.items())),
        'projects': {name: dict(sorted(counts.items())) for name, counts in sorted(projects.items())},
    }
    assert sum(states.values()) == len(rows)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
