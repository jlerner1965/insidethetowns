#!/usr/bin/env python3
"""Proof of concept: what a weekly transit service-change watch would report.

  summarize(feed.zip, monday)  -> per route: trips on a typical weekday, Saturday,
                                  Sunday, and the first/last departure, for the
                                  week starting that Monday.
  diff(old, new)               -> plain-English changes, with noise rules.

Routes are matched by the name riders see (route_short_name, else long name),
never by internal ids, and service is counted on real calendar dates
(calendar.txt + calendar_dates.txt), so renumbered ids and calendar rollovers
do not show up as changes.
"""
import csv, io, sys, zipfile, datetime as dt, json
from collections import defaultdict

csv.field_size_limit(10**9)

def rows(z, name):
    try:
        f = z.open(name)
    except KeyError:
        return
    with f:
        for r in csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig')):
            yield {(k or '').strip(): (v or '').strip() for k, v in r.items()}

def d(s): return dt.date(int(s[:4]), int(s[4:6]), int(s[6:8]))
DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

def secs(t):
    try:
        h, m, s = t.split(':'); return int(h)*3600 + int(m)*60 + int(s)
    except Exception:
        return None

def hhmm(s):
    if s is None: return '—'
    h, m = divmod(s // 60, 60)
    return f"{h%24:02d}:{m:02d}" + ('+1' if h >= 24 else '')

def feed_range(z):
    lo = hi = None
    for r in rows(z, 'calendar.txt'):
        a, b = d(r['start_date']), d(r['end_date'])
        lo = a if lo is None or a < lo else lo; hi = b if hi is None or b > hi else hi
    for r in rows(z, 'calendar_dates.txt'):
        a = d(r['date'])
        lo = a if lo is None or a < lo else lo; hi = a if hi is None or a > hi else hi
    return lo, hi

def summarize(path, monday):
    z = zipfile.ZipFile(path)
    week = [monday + dt.timedelta(days=i) for i in range(7)]
    active = defaultdict(set)                       # date -> service_ids
    for r in rows(z, 'calendar.txt'):
        a, b = d(r['start_date']), d(r['end_date'])
        for day in week:
            if a <= day <= b and r[DAYS[day.weekday()]] == '1':
                active[day].add(r['service_id'])
    exceptions = 0
    for r in rows(z, 'calendar_dates.txt'):
        day = d(r['date'])
        if day in week:
            if r['exception_type'] == '1': active[day].add(r['service_id'])
            else: active[day].discard(r['service_id']); exceptions += 1
    name = {}; mode = {}
    for r in rows(z, 'routes.txt'):
        name[r['route_id']] = r.get('route_short_name') or r.get('route_long_name') or r['route_id']
        mode[r['route_id']] = r.get('route_type', '')
    trip_route = {}; trip_service = {}
    for r in rows(z, 'trips.txt'):
        trip_route[r['trip_id']] = r['route_id']; trip_service[r['trip_id']] = r['service_id']
    wanted = set().union(*active.values()) if active else set()
    start = {}                                      # trip -> first departure
    for r in rows(z, 'stop_times.txt'):
        t = r['trip_id']
        if trip_service.get(t) not in wanted: continue
        s = secs(r.get('departure_time') or r.get('arrival_time') or '')
        if s is not None and (t not in start or s < start[t]): start[t] = s
    by_service = defaultdict(list)
    for t, sv in trip_service.items():
        if sv in wanted: by_service[sv].append(t)
    out = defaultdict(lambda: {'wk': [], 'sat': 0, 'sun': 0, 'first': None, 'last': None, 'mode': ''})
    for day in week:
        counts = defaultdict(int)
        for sv in active[day]:
            for t in by_service[sv]:
                key = name[trip_route[t]]; counts[key] += 1
                o = out[key]; o['mode'] = mode[trip_route[t]]
                if day.weekday() < 5 and t in start:
                    s = start[t]
                    o['first'] = s if o['first'] is None or s < o['first'] else o['first']
                    o['last'] = s if o['last'] is None or s > o['last'] else o['last']
        for key, c in counts.items():
            if day.weekday() < 5: out[key]['wk'].append(c)
            elif day.weekday() == 5: out[key]['sat'] = c
            else: out[key]['sun'] = c
    res = {}
    for key, o in out.items():
        wk = sorted(o['wk'])
        res[key] = {'weekday': wk[len(wk)//2] if wk else 0,   # median weekday: one odd day cannot move it
                    'sat': o['sat'], 'sun': o['sun'], 'first': o['first'], 'last': o['last'], 'mode': o['mode']}
    return res, exceptions

def diff(old, new, min_trips=4, min_pct=0.10, min_span=30*60):
    """Returns (big, small) lists of plain-English lines."""
    big, small = [], []
    for r in sorted(set(old) - set(new)): big.append(f"Route {r}: no longer runs (was {old[r]['weekday']} trips a weekday)")
    for r in sorted(set(new) - set(old)): big.append(f"Route {r}: new, {new[r]['weekday']} trips a weekday")
    for r in sorted(set(old) & set(new)):
        a, b = old[r], new[r]
        for k, label in (('weekday','weekday'), ('sat','Saturday'), ('sun','Sunday')):
            x, y = a[k], b[k]
            if x == y: continue
            if x > 0 and y == 0: big.append(f"Route {r}: {label} service ends (was {x} trips)"); continue
            if x == 0 and y > 0: big.append(f"Route {r}: {label} service starts ({y} trips)"); continue
            delta = y - x
            line = f"Route {r}: {label} trips {x} → {y} ({delta:+d}, {delta/x:+.0%})"
            (big if abs(delta) >= min_trips and abs(delta)/x >= min_pct else small).append(line)
        if a['last'] and b['last'] and a['last'] - b['last'] >= min_span:
            big.append(f"Route {r}: last weekday departure now {hhmm(b['last'])} (was {hhmm(a['last'])})")
        if a['first'] and b['first'] and b['first'] - a['first'] >= min_span:
            big.append(f"Route {r}: first weekday departure now {hhmm(b['first'])} (was {hhmm(a['first'])})")
    return big, small

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'range':
        print(feed_range(zipfile.ZipFile(sys.argv[2])))
    elif cmd == 'compare':            # compare OLD.zip MONDAY NEW.zip MONDAY
        o, eo = summarize(sys.argv[2], d(sys.argv[3])); n, en = summarize(sys.argv[4], d(sys.argv[5]))
        big, small = diff(o, n)
        print(f"routes: {len(o)} → {len(n)}; holiday exceptions in week: old {eo}, new {en}")
        print(f"REPORTED ({len(big)}):"); [print('  ' + l) for l in big]
        print(f"below threshold, not reported ({len(small)}):"); [print('  ' + l) for l in small[:12]]
        if len(small) > 12: print(f"  … and {len(small)-12} more")
