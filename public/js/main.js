const verifyButton = document.getElementById('verifyUpiBtn');

if (verifyButton) {
  verifyButton.addEventListener('click', async () => {
    const upiInput = document.getElementById('receiverUpiId');
    const result = document.getElementById('verifyResult');
    const upiId = upiInput.value.trim();

    if (!upiId) {
      result.textContent = 'Enter a receiver UPI ID first.';
      result.className = 'form-text text-danger';
      return;
    }

    try {
      const response = await fetch('/upi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upi_id: upiId })
      });
      const data = await response.json();

      if (data.valid) {
        result.textContent = `Verified: ${data.name}`;
        result.className = 'form-text text-success';
      } else {
        result.textContent = data.message;
        result.className = 'form-text text-danger';
      }
    } catch (error) {
      result.textContent = 'Unable to verify UPI ID.';
      result.className = 'form-text text-danger';
    }
  });
}

const RECEIVED_PAYMENT_KEY = 'upi:lastSeenReceivedTransactionId';

// Realtime socket connection for instant notifications
if (document.body && document.body.dataset.authenticated === 'true') {
  try {
    const userId = document.body.dataset.userId;
    const script = document.createElement('script');
    script.src = '/socket.io/socket.io.js';
    script.onload = () => {
      const socket = io();
      if (userId) socket.emit('join', { userId });

      socket.on('money_received', (payload) => {
        // Show the same toast UI used for polling
        buildReceivedPaymentToast(payload.transaction);
      });
    };
    document.body.appendChild(script);
  } catch (e) {
    // ignore realtime failures
  }
}

function buildReceivedPaymentToast(transaction) {
  const existingToast = document.querySelector('.received-payment-toast');

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('button');
  toast.type = 'button';
  toast.className = 'received-payment-toast';

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = '+';

  const content = document.createElement('span');
  content.className = 'toast-content';

  const title = document.createElement('strong');
  title.textContent = 'Money received';

  const details = document.createElement('span');
  details.textContent = `Rs. ${Number(transaction.amount).toFixed(2)} from ${transaction.sender_name || transaction.sender_upi}`;

  const action = document.createElement('span');
  action.className = 'toast-arrow';
  action.textContent = 'View';

  content.append(title, details);
  toast.append(icon, content, action);

  toast.addEventListener('click', () => {
    localStorage.setItem(RECEIVED_PAYMENT_KEY, String(transaction.tr_id));
    window.location.href = `/transaction/history?highlight=${transaction.tr_id}`;
  });

  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('is-visible');
  }, 50);
}

async function checkLatestReceivedPayment() {
  try {
    const response = await fetch('/transaction/latest-received');

    if (!response.ok) {
      return;
    }

    const { transaction } = await response.json();

    if (!transaction) {
      return;
    }

    const lastSeenId = localStorage.getItem(RECEIVED_PAYMENT_KEY);

    if (String(transaction.tr_id) !== lastSeenId) {
      buildReceivedPaymentToast(transaction);
    }
  } catch (error) {
    // Ignore notification failures so normal page actions keep working.
  }
}

if (document.body && document.body.dataset.authenticated === 'true') {
  checkLatestReceivedPayment();
  window.setInterval(checkLatestReceivedPayment, 15000);
}
