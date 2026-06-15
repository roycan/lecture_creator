# Quiz: Git & GitHub

## Maria made changes to her project and wants to save a permanent snapshot of those changes in Git. Which two commands must she run in order?
* [ ] `git save` then `git push`
* [x] `git add .` then `git commit -m "message"`
* [ ] `git commit` then `git add`
* [ ] `git snapshot` then `git save`

## What does this command do?
```bash
git status
```
* [ ] Pushes changes to GitHub
* [x] Shows which files have been changed, which are staged, and which are untracked
* [ ] Shows the commit history
* [ ] Creates a new branch

## Carlo wants to see a history of all his commits with messages and dates. Which command should he use?
* [ ] `git history`
* [ ] `git show`
* [x] `git log`
* [ ] `git list`

## What does this command do?
```bash
git push origin main
```
* [ ] Downloads the latest changes from GitHub
* [x] Uploads local commits on the `main` branch to the remote repository named `origin` on GitHub
* [ ] Deletes the main branch
* [ ] Merges two branches together

## Liza and her group are working on the same project. Before she starts working each day, what command should she run to get the latest changes her teammates pushed?
* [ ] `git fetch`
* [x] `git pull`
* [ ] `git update`
* [ ] `git sync`

## A `.gitignore` file is used to tell Git which files to ___.
Answer: ignore
Answer: not track
Answer: exclude

## Juan accidentally committed a file containing a database password. He wants to prevent it from being tracked in future commits. After adding it to `.gitignore`, what additional command does he need to run to remove it from Git's tracking?
* [ ] `git delete filename`
* [x] `git rm --cached filename`
* [ ] `git remove filename`
* [ ] `git untrack filename`

## What is the purpose of a branch in Git?
* [ ] It deletes old code to save space
* [x] It lets you work on a feature or experiment independently without affecting the `main` branch
* [ ] It creates a backup on GitHub
* [ ] It splits a large file into smaller files

## Carlo created a feature branch, made changes, and wants to combine those changes back into `main`. Which command does this?
* [ ] `git combine main`
* [x] `git merge`
* [ ] `git join`
* [ ] `git attach`

## Maria and her teammate edited the SAME line of code and both committed. When Maria tries to merge, Git shows a `___` that she must resolve manually.
Answer: merge conflict
Answer: conflict

## What is a Pull Request (PR) on GitHub?
* [ ] A request to delete a repository
* [x] A proposal to merge changes from one branch into another, which teammates can review before approving
* [ ] A way to download someone else's code
* [ ] A bug report filed by users

## Which command creates a local copy of a repository that exists on GitHub?
* [ ] `git copy <url>`
* [ ] `git download <url>`
* [x] `git clone <url>`
* [ ] `git fetch <url>`
