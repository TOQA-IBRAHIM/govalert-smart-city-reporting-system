// scripts.js

app.get('/api/current-user', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
  pool.query(
    "SELECT id, name, email, phone_num FROM users WHERE id = ?",
    [req.session.userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results[0]);
    }
  );
});
fetch('/api/current-user')
  .then(res => res.json())
  .then(data => {
    const USER_ID = data.id;
    // Use USER_ID for subsequent requests
  });
// Load profile data when on profile.html
if (window.location.pathname.endsWith("profile.html")) {
  // Fetch user details
  fetch(`/api/user/${USER_ID}`)
    .then(res => res.json())
    .then(data => {
      const usernameElement = document.getElementById('username');
      const totalIssuesElement = document.getElementById('totalIssues');
      const solvedIssuesElement = document.getElementById('solvedIssues');

      if (data.error) {
        alert(data.error);
      } else {
        usernameElement.textContent = data.name;
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error loading profile.');
    });

  // Fetch total reports
  fetch(`/api/reports/count/${USER_ID}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('totalIssues').textContent = data.total_reports || 0;
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching report count.');
    });

  // Fetch solved reports
  fetch(`/api/reports/solved/${USER_ID}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('solvedIssues').textContent = data.solved_reports || 0;
    })
    .catch(err => {
      console.error(err);
      alert('Error fetching solved report count.');
    });

  // Handle edit profile button
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    window.location.href = 'edit-profile.html';
  });
}

// Handle menu links
document.querySelector('.menu').addEventListener('click', (e) => {
  e.preventDefault();
  if (e.target.tagName === 'A') {
    const href = e.target.getAttribute('href');
    switch (href) {
      case '#report-problem':
        window.location.href = 'report-form.html';
        break;
      case '#add-account':
        window.location.href = 'signup.html';
        break;
      case '#logout':
        window.location.href = 'index.html';
        break;
    }
  }
});

if (window.location.pathname.endsWith("edit-profile.html")) {
  const editForm = document.getElementById('editForm');

  fetch('/api/current-user', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        window.location.href = 'index.html';
      } else {
        document.getElementById('name').value = data.name;
        document.getElementById('email').value = data.email;
        document.getElementById('phone').value = data.phone_num;
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error loading profile data.');
    });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(editForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone_num: formData.get('phone')
    };

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, message: 'Your profile has been updated.' })
        });
        alert('Profile updated successfully!');
        window.location.href = 'profile.html';
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error updating profile: ${error.message}`);
    }
  });
}
// Sample data - normally you'd fetch this from an API or localStorage
const reports = [
  { id: 1, title: "Broken street light" },
  { id: 2, title: "Water leakage in park" },
  { id: 3, title: "Trash not collected" }
];

fetch(`/api/reports/user/${USER_ID}`)
  .then(res => res.json())
  .then(reports => {
    const container = document.getElementById("reportsContainer");
    container.innerHTML = '';
    reports.forEach(report => {
      const div = document.createElement("div");
      div.className = "report-card";
      div.innerHTML = `
        <div class="report-title">${report.title}</div>
        <a class="chat-btn" href="chat.html?report_id=${report.id}">💬 Report as Chat</a>
      `;
      container.appendChild(div);
    });
  });
fetch('/api/current-user')
  .then(res => res.json())
  .then(data => {
    const USER_ID = data.id;
    // Use USER_ID for subsequent requests
  });