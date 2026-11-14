# Sports fixtures: the files of 11 November 2026, frozen

Copies of four school-sports files as the sports workflow wrote them on
11 November 2026 (commit b5569f05), trimmed to the teams the tests read:

- `data/windsor/sports-severance-high.json`: football
- `data/berthoud/sports.json`, `data/niwot/sports.json`,
  `data/windsor/sports-windsor-high.json`: volleyball

`test/postseason.test.ts` and `test/sports.test.ts` read these, not the
live files under `data/`, when they check how the pages read a real file
on a fixed day: CHSAA's postseason rows merged in, and what CHSAA settles
applied over MaxPreps. The live files are rewritten after every run, so a
game the tests expect to come becomes a result once it is played; on 14
November 2026 both tests failed that way with nothing wrong.

They are never built into a page. Do not refresh them from the live files:
the tests' dates and expectations are set to this copy.
