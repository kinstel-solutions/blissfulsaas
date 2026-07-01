---
name: git-alex
description: Run the git-alex workflow to automatically stage, commit, push the current branch, merge to main, push main, and restore the original branch.
---

# Git Commit, Push, and Merge Workflow (git-alex)

Use this skill when the user mentions "git-alex" or requests to "commit, push and merge" local changes.

## Steps to Execute

1. **Detect Current Branch**: Run `git branch --show-current` to identify the branch you are working on (e.g., `staging` or a feature branch). Let's call this `<current_branch>`.
2. **Stage and Commit**:
   * Run `git add .` to stage all local modified and untracked files.
   * Run `git commit -m "<message>"` with a concise description summarizing the changes made during the session.
3. **Push Feature Branch**: Run `git push origin <current_branch>` to back up the current branch on the remote.
4. **Switch to main**: Run `git checkout main`.
5. **Merge Changes**: Run `git merge <current_branch> --no-edit` to merge the staging/feature changes into `main` using default commit messages.
6. **Push Main**: Run `git push origin main` to update production.
7. **Restore Original Branch**: Run `git checkout <current_branch>` to return to the workspace branch and resume development.
