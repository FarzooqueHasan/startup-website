function handleContactSubmit(e) {
  e.preventDefault();
  const name = e.target.name.value;
  const email = e.target.email.value;
  const message = e.target.message.value;
  alert(`Name: ${name}\nEmail: ${email}\nMessage: ${message}`);
}

function handleWaitlistSubmit(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const updates = e.target.updates.value;
  alert(`Email: ${email}\nWants Updates: ${updates}`);
}

async function fetchUpdates() {
  const res = await fetch("https://hn.algolia.com/api/v1/search?query=technology");
  const data = await res.json();
  const posts = data.hits.slice(0, 5);
  const list = posts.map(post =>
    `<p><a href="${post.url}" target="_blank">${post.title}</a></p>`
  ).join('');
  document.getElementById("updates").innerHTML = list;
}