# Quiz: Production Best Practices

## Maria deployed her sari-sari store app to Railway. She committed her `node_modules/` folder and her `.env` file (with database passwords) to GitHub. What did she do wrong?
* [ ] Nothing — this is standard practice
* [x] She should have added `node_modules/` and `.env` to `.gitignore` — committing dependencies bloats the repo and committing secrets exposes passwords
* [ ] She should have used GitLab instead
* [ ] She should have committed only the `.env` file

## What is the purpose of a `.env` file in a web project?
* [ ] It stores CSS environment variables
* [x] It stores configuration secrets (database URLs, API keys, passwords) that should NOT be committed to Git
* [ ] It stores HTML environment settings
* [ ] It stores the project's dependencies

## Carlo's app crashes when the database is temporarily unavailable. The entire app shows a white screen with an error. What is a best practice to prevent this?
* [ ] Never connect to a database
* [x] Wrap database operations in `try/catch` blocks and show a user-friendly error page instead of crashing
* [ ] Use a larger server
* [ ] Restart the server every hour

## Making a copy of your data regularly so you can restore it if something is lost or corrupted What does "backing up your database" mean and why is it important?
Answer: Backup
Answer: backup
Answer: backing up
Answer: backups
Answer: back up
Answer: Back up
Answer: Back Up

## Liza notices her deployed app is slow because it loads 500 products from the database on every page load. What is a practical improvement?
* [ ] Show fewer HTML elements
* [x] Add pagination or lazy loading so only a subset of products is fetched at a time
* [ ] Use a bigger font
* [ ] Remove CSS

## True or False: Once you deploy your app to Railway, you never need to update it again.
* [ ] True
* [x] False — you should regularly update dependencies for security patches, monitor for errors, and fix bugs reported by users

## What is a "log" in the context of a production web app?
* [ ] A tree trunk
* [x] A recorded message (like `console.log` or error messages) that helps you diagnose problems when the app is running on a server
* [ ] A type of database table
* [ ] A CSS property

## Juan's app works on his laptop but crashes when deployed to Railway. What is the most common cause?
* [ ] Railway is broken
* [x] A hardcoded local path (like `localhost:3000` or a local file path) that works on his machine but not on the server
* [ ] The internet is too slow
* [ ] Bulma doesn't work on Railway
