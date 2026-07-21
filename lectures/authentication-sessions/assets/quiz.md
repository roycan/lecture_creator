# Quiz: Authentication & Sessions

## Maria wants users to log in to her sari-sari store app. After login, the server needs to "remember" who the user is across multiple page requests. What mechanism does Express use for this?
* [ ] JWT tokens
* [x] Sessions (server-side storage with a session cookie)
* [ ] LocalStorage
* [ ] URL parameters

## What should NEVER be stored in plain text in your database?
* [ ] Usernames
* [ ] Email addresses
* [x] Passwords — they should be hashed using a library like bcrypt
* [ ] Product names

## Carlo wants to restrict the `/admin` page so only logged-in users can access it. What is this concept called?
* [ ] Authentication
* [x] Authorization — checking whether a user has permission to access a specific resource
* [ ] Encryption
* [ ] Validation

## What verifies who you are (login), and not the one that checks what you're allowed to do (permissions)?
Answer: Authentication
Answer: authentication 
Answer: authN 

## Liza logs in to a website, then closes her browser and opens it again the next day. She is still logged in. What is most likely keeping her session alive?
* [ ] The server never forgets
* [x] A persistent cookie stored in her browser that the server recognizes on each request
* [ ] Her IP address
* [ ] Her username is in the URL

## What does it mean to "hash" a password?
* [ ] Encrypt it so it can be decrypted later
* [x] Convert it into a one-way scrambled string that cannot be reversed — you verify by hashing the input and comparing the hashes
* [ ] Add a random number to the end
* [ ] Store it in a cookie

## Juan's app has two roles: "admin" (can delete products) and "staff" (can only add products). When a staff member tries to delete a product, what should the app check?
* [ ] Whether the staff member is logged in
* [x] Whether the staff member's role has authorization (permission) for the delete action — not just whether they're logged in
* [ ] Whether the product exists
* [ ] Whether the internet is connected

## True or False: Storing a user's password in a browser cookie is a secure way to keep them logged in.
* [ ] True
* [x] False — cookies can be read by the user or stolen. Use server-side sessions with a session ID cookie instead.
