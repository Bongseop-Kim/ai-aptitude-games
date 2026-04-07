# Branch Protection for `main`

This repository protects `main` with required pull requests and CI checks.

## Current Settings

Applied on 2026-04-07 via GitHub API (`Bongseop-Kim/ai-aptitude-games`):

- Require a pull request before merging: enabled
- Required approving reviews: `1`
- Dismiss stale approvals when new commits are pushed: enabled
- Require status checks to pass before merging: enabled
- Required status checks:
  - `build-and-test`
- Require branches to be up to date before merging (`strict`): enabled
- Allow force pushes: disabled
- Allow deletions: disabled

## Stable Required Check Name

Branch protection binds to a status check context string. In this repository, that context is `build-and-test`.

To keep it stable:

- Keep workflow job id `build-and-test` in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Keep explicit job `name: build-and-test` so the check run label remains consistent

If this check name changes, update both:

1. workflow job name/id
2. branch protection required check contexts

## Configure / Re-apply

```bash
repo='Bongseop-Kim/ai-aptitude-games'
gh api -X PUT repos/$repo/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build-and-test"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_conversation_resolution": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_linear_history": false,
  "lock_branch": false,
  "allow_fork_syncing": false
}
JSON
```

## Evidence Export

```bash
repo='Bongseop-Kim/ai-aptitude-games'
gh api repos/$repo/branches/main/protection
```

Recommended quick verification:

```bash
repo='Bongseop-Kim/ai-aptitude-games'
gh api repos/$repo/branches/main/protection \
  --jq '{strict: .required_status_checks.strict, contexts: .required_status_checks.contexts, dismiss_stale_reviews: .required_pull_request_reviews.dismiss_stale_reviews, required_approving_review_count: .required_pull_request_reviews.required_approving_review_count}'
```

## Rollback Notes

To temporarily relax protection during emergency remediation:

1. Keep PR requirement enabled when possible.
2. If needed, clear required checks only:

```bash
repo='Bongseop-Kim/ai-aptitude-games'
gh api -X PATCH repos/$repo/branches/main/protection/required_status_checks \
  -f strict=false \
  -f contexts[]=
```

3. Re-apply the full configuration immediately after remediation using the `Configure / Re-apply` command above.

Do not disable branch protection entirely unless repository administrators explicitly approve it.
