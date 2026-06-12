<<<<<<< HEAD
async function checkAuth() {
  try {
    const res = await fetch('/auth/me');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function handleContactSubmit(e) {
=======
function handleContactSubmit(e) {
>>>>>>> 4a910aa73e0ace54d5cedb9c754656229f895e0e
  e.preventDefault();
  const name = e.target.name.value;
  const email = e.target.email.value;
  const message = e.target.message.value;

<<<<<<< HEAD
  alert(`Name: ${name}\nEmail: ${email}\nMessage: ${message}`);

  localStorage.setItem('contactSubmission', JSON.stringify({ name, email, message }));

  try {
    await fetch('/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
  } catch (err) {
    console.error(err);
  }
=======
  alert(`Thank you, ${name}!\nWe will contact you at ${email}.`);

  // Save to localStorage
  localStorage.setItem('contactSubmission', JSON.stringify({ name, email, message }));

  // Send to Webhook.site (replace with your real URL)
  fetch('https://webhook.site/3ecd0d06-9b10-422a-9c28-420fa5dd7ed4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message })
  });
>>>>>>> 4a910aa73e0ace54d5cedb9c754656229f895e0e

  e.target.reset();
  window.location.href = 'thankyou.html';
}

<<<<<<< HEAD
async function handleWaitlistSubmit(e) {
=======
function handleWaitlistSubmit(e) {
>>>>>>> 4a910aa73e0ace54d5cedb9c754656229f895e0e
  e.preventDefault();
  const email = e.target.email.value;
  const updates = e.target.updates.value;

  if (!email || !updates) {
    alert('Please enter a valid email and select an update preference.');
    return;
  }

<<<<<<< HEAD
  alert(`Email: ${email}\nReceive Updates: ${updates}`);

  localStorage.setItem('waitlistSubmission', JSON.stringify({ email, updates }));

  try {
    await fetch('/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, updates })
    });
  } catch (err) {
    console.error(err);
  }
=======
  alert(`You've joined the waitlist with email: ${email}\nUpdate preference: ${updates}`);

  // Save to localStorage
  localStorage.setItem('waitlistSubmission', JSON.stringify({ email, updates }));

  // Send to Webhook.site (replace with your real URL)
  fetch('https://webhook.site/3ecd0d06-9b10-422a-9c28-420fa5dd7ed4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, updates })
  });
>>>>>>> 4a910aa73e0ace54d5cedb9c754656229f895e0e

  e.target.reset();
  window.location.href = 'thankyou.html';
}

<<<<<<< HEAD
async function handleRegisterSubmit(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const bio = e.target.bio.value;
  const gender = e.target.gender.value;

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, bio, gender })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Registration successful!');
      window.location.reload();
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Logged in successfully!');
      window.location.reload();
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleLogoutClick() {
  try {
    const res = await fetch('/auth/logout', { method: 'POST' });
    if (res.ok) {
      alert('Logged out successfully!');
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleUpdateProfileSubmit(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const bio = e.target.bio.value;
  const gender = e.target.gender.value;

  const updateData = {};
  if (email) updateData.email = email;
  if (password) updateData.password = password;
  if (bio) updateData.bio = bio;
  if (gender) updateData.gender = gender;

  try {
    const res = await fetch('/auth/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (res.ok) {
      alert('Profile updated successfully!');
      window.location.reload();
    } else {
      const data = await res.json();
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleDeleteAccountClick() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return;
  }
  try {
    const res = await fetch('/auth/delete', { method: 'DELETE' });
    if (res.ok) {
      alert('Account deleted successfully.');
      window.location.href = 'index.html';
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadProfile() {
  const user = await checkAuth();
  const authForms = document.getElementById('auth-forms');
  const profileContainer = document.getElementById('profile-container');

  if (user) {
    authForms.style.display = 'none';
    profileContainer.style.display = 'block';
    document.getElementById('user-email').innerText = user.email;
    document.getElementById('user-bio').innerText = user.bio || 'N/A';
    document.getElementById('user-gender').innerText = user.gender || 'N/A';
    document.getElementById('user-id').innerText = user._id;
  } else {
    authForms.style.display = 'block';
    profileContainer.style.display = 'none';
  }
}

async function fetchMessagesForUser() {
  const userId = document.getElementById('queryUserId').value;
  if (!userId) {
    alert('Please enter a User ID.');
    return;
  }

  try {
    const res = await fetch(`/message/${userId}`);
    if (res.ok) {
      const messages = await res.json();
      const listDiv = document.getElementById('messagesList');
      if (messages.length === 0) {
        listDiv.innerHTML = '<p>No messages found for this user.</p>';
        return;
      }
      listDiv.innerHTML = messages.map(msg => `
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left;">
          <p><strong>Name:</strong> ${msg.name}</p>
          <p><strong>Email:</strong> ${msg.email}</p>
          <p><strong>Message:</strong> <span id="msg-text-${msg._id}">${msg.message}</span></p>
          <button onclick="editMessage('${msg._id}')" style="margin-top: 10px; padding: 5px 10px; font-size: 14px; background: #2c5364; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit Message</button>
        </div>
      `).join('');
    } else {
      alert('Failed to fetch messages.');
    }
  } catch (err) {
    console.error(err);
  }
}

async function editMessage(id) {
  const currentText = document.getElementById(`msg-text-${id}`).innerText;
  const newText = prompt('Update message:', currentText);
  if (newText === null || newText.trim() === '') {
    return;
  }

  try {
    const res = await fetch(`/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newText })
    });
    if (res.ok) {
      alert('Message updated successfully.');
      fetchMessagesForUser();
    } else {
      alert('Failed to update message.');
    }
  } catch (err) {
    console.error(err);
  }
}

async function fetchUpdates() {
  const query = document.getElementById('searchBox').value || 'AI';
  const tag = document.getElementById('filterTag') ? document.getElementById('filterTag').value : '';
  let url = `https://hn.algolia.com/api/v1/search?query=${query}`;
  if (tag) {
    url += `&tags=${tag}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    const list = data.hits.slice(0, 5).map(post =>
      `<p><a href="${post.url || '#'}" target="_blank">${post.title || post.story_title || 'Untitled'}</a></p>`
    ).join('');
    document.getElementById('updates').innerHTML = list || '<p>No updates found.</p>';
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  if (path.includes('waitlist.html')) {
    const user = await checkAuth();
    if (user) {
      document.getElementById('waitlist-form-container').style.display = 'block';
      document.getElementById('waitlist-auth-message').style.display = 'none';
    } else {
      document.getElementById('waitlist-form-container').style.display = 'none';
      document.getElementById('waitlist-auth-message').style.display = 'block';
    }
  } else if (path.includes('account.html')) {
    await loadProfile();
  } else if (path.includes('updates.html')) {
    await fetchUpdates();
  }
});
=======
async function fetchUpdates() {
  const query = document.getElementById("searchBox").value || "AI";
  const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${query}`);
  const data = await res.json();
  const list = data.hits.slice(0, 5).map(post =>
    `<p><a href="${post.url}" target="_blank">${post.title}</a></p>`
  ).join('');
  document.getElementById("updates").innerHTML = list;
}
>>>>>>> 4a910aa73e0ace54d5cedb9c754656229f895e0e
