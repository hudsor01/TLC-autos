---
phase: quick
plan: 260318-m3o
subsystem: infra
tags: [ssh, security, config]

requires: []
provides:
  - "Hardened SSH config with correct TTY, logging, host key, and identity settings"
affects: []

tech-stack:
  added: []
  patterns:
    - "Host * block at bottom of ~/.ssh/config so per-host overrides take effect"

key-files:
  created: []
  modified:
    - "~/.ssh/config"

key-decisions:
  - "Moved Host * block to bottom of file so per-host StrictHostKeyChecking override actually works (SSH first-match-wins)"
  - "dev-server and dev confirmed as separate hosts (different subnets 192.168.0.x vs 192.168.4.x, different keys) -- both kept"
  - "SendEnv/SetEnv lines left as-is (harmless if remote lacks AcceptEnv)"

patterns-established: []

requirements-completed: []

duration: 1min
completed: 2026-03-18
---

# Quick Task 260318-m3o: Fix SSH Config Issues Summary

**Hardened SSH config: RequestTTY auto, LogLevel INFO, accept-new host keys, pinned homelab identity, and Host * moved to bottom for correct override precedence**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-18T20:56:36Z
- **Completed:** 2026-03-18T20:57:58Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Changed RequestTTY from yes to auto, fixing scp/rsync/git-over-ssh breakage
- Changed LogLevel from ERROR to INFO, surfacing host key change warnings
- Changed dev-server-tailscale StrictHostKeyChecking from no to accept-new, eliminating MITM risk
- Added IdentityFile and IdentitiesOnly to homelab block for consistent key pinning
- Fixed dev block indentation from 6 spaces to 4 spaces
- Moved Host * block to bottom of file so per-host overrides take effect (deviation)

## Task Commits

No git commits possible -- ~/.ssh/config is outside any git repository. Changes applied directly to the file in place.

## Files Modified

- `~/.ssh/config` - Hardened global defaults, per-host security, consistent formatting

## Decisions Made

- **Host * moved to bottom:** SSH config uses first-match-wins. With Host * at the top, per-host overrides (like StrictHostKeyChecking accept-new on dev-server-tailscale) were silently ignored. Moving Host * to the bottom ensures specific host blocks take precedence. The OrbStack Include directive remains at the very top as required by OrbStack.
- **dev-server vs dev are separate hosts:** dev-server (192.168.0.134, id_ed25519) and dev (192.168.4.163, id_ed25519_homelab) are on different subnets with different keys -- both retained as-is.
- **SendEnv/SetEnv left unchanged:** These are harmless if the remote sshd lacks matching AcceptEnv directives (silently ignored), and potentially useful if servers do accept them.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Moved Host * block to bottom of file**
- **Found during:** Task 1 (verification step)
- **Issue:** SSH config uses first-match-wins ordering. With Host * at the top, its StrictHostKeyChecking ask was matched first for all hosts, making the per-host StrictHostKeyChecking accept-new on dev-server-tailscale completely ineffective.
- **Fix:** Restructured file to place all specific Host blocks before the Host * global defaults block. OrbStack Include remains at top as required.
- **Files modified:** ~/.ssh/config
- **Verification:** `ssh -G dev-server-tailscale | grep stricthostkeychecking` now correctly outputs `accept-new`

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Essential fix -- without it, the StrictHostKeyChecking change in the plan would have been ineffective.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

N/A - standalone quick task.

## Self-Check: PASSED

- ~/.ssh/config: FOUND
- SUMMARY.md: FOUND
- RequestTTY auto: PASS
- LogLevel INFO: PASS
- StrictHostKeyChecking accept-new: PASS
- homelab IdentityFile: PASS
- homelab IdentitiesOnly: PASS
- dev indentation (4 spaces): PASS
- ssh -G dev-server-tailscale resolves stricthostkeychecking=accept-new: PASS

---
*Quick task: 260318-m3o*
*Completed: 2026-03-18*
