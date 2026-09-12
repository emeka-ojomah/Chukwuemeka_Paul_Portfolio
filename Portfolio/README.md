# Portfolio — Edit Checklist

This site is plain HTML/CSS/JS — no build step. Just open any `.html` file
in a browser to preview, and edit the text in any code/text editor.

## Files
```
portfolio/
├── index.html      → Home
├── about.html       → About
├── projects.html     → Projects (carousel)
├── services.html     → Services + prices
├── contact.html      → Contact (socials + form)
├── css/style.css     → all styling, shared across every page
├── js/script.js      → nav toggle, carousel, contact form logic
└── README.md         → this file
```

## Things to edit before publishing

### 1. Social links (contact.html + footer of every page)
Find the 5 `href="#"` links (Gmail, WhatsApp, TikTok, Instagram, Facebook)
and replace with your real links:
- Gmail: `mailto:youremail@gmail.com`
- WhatsApp: `https://wa.me/2348XXXXXXXXX` (no + or leading 0)
- TikTok / Instagram / Facebook: your profile URLs

### 2. Contact form email (js/script.js)
```js
const to = 'chukwuemekaojomah@gmail.com';
```
This is what makes the "Send Message" button open the visitor's email app
with the message pre-filled — update it if the address ever changes.

### 3. Profile photo (index.html)
Replace `images.png` with your real photo — swap the file and update the
`src` on the avatar `<img>` in the hero section.

### 4. Resume/CV (about.html)
Replace `/resume.pdf` with your actual CV filename, and add that PDF file
into the folder.

### 5. Projects (projects.html)
Each slide currently shows a themed placeholder (a `.slide-media` div with a
gradient + icon) instead of a real screenshot. For each of the 4 slides,
update:
- `data-url="https://example.com/..."` → the live link to that project
- `data-tech="..."` → space-separated tags (`react`, `nextjs`, `supabase`,
  `tailwind`) so it shows up under the right filter buttons
- the title and description text
- when you have a real screenshot, replace the `.slide-media` div with
  `<img src="your-screenshot.jpg" alt="...">` and drop the placeholder classes

Add more projects by copying an existing `<a class="slide">...</a>` block.
If you add a new tag that isn't one of the four filter buttons, add a
matching `<button class="filter-btn" data-filter="yourtag">` in the
`.filter-bar`.

### 6. Testimonials (index.html)
The "What clients say" section is commented out until there's real feedback
to show. Uncomment it and fill in real quotes when you have them.

### 7. Prices (services.html)
Each service card has a `.price-tag` with a placeholder amount, and the
cost estimator below it has a matching `data-price` on each checkbox —
update both together if you change your rates.

### 8. Bio & timeline (about.html)
Update the bio text and the "git log" career timeline dates/entries to
match your real background.

## Hosting
Once edited, this can be hosted for free on GitHub Pages, Netlify, or
Vercel — just upload the whole `portfolio` folder.
