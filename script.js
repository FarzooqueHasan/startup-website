function handleContactSubmit(e) {
  e.preventDefault();
  const name = e.target.name.value;
  const email = e.target.email.value;
  const message = e.target.message.value;

  alert(`Thank you, ${name}!\nWe will contact you at ${email}.`);

  // Save to localStorage
  localStorage.setItem('contactSubmission', JSON.stringify({ name, email, message }));

  // Send to Webhook.site (replace with your real URL)
  fetch('https://webhook.site/YOUR-UNIQUE-ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message })
  });

  e.target.reset();
  window.location.href = 'thankyou.html';
}

function handleWaitlistSubmit(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const updates = e.target.updates.value;

  if (!email || !updates) {
    alert('Please enter a valid email and select an update preference.');
    return;
  }

  alert(`You've joined the waitlist with email: ${email}\nUpdate preference: ${updates}`);

  // Save to localStorage
  localStorage.setItem('waitlistSubmission', JSON.stringify({ email, updates }));

  // Send to Webhook.site (replace with your real URL)
  fetch('https://webhook.site/YOUR-UNIQUE-ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, updates })
  });

  e.target.reset();
  window.location.href = 'thankyou.html';
}

async function fetchUpdates() {
  const query = document.getElementById("searchBox").value || "AI";
  const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${query}`);
  const data = await res.json();
  const list = data.hits.slice(0, 5).map(post =>
    `<p><a href="${post.url}" target="_blank">${post.title}</a></p>`
  ).join('');
  document.getElementById("updates").innerHTML = list;
}