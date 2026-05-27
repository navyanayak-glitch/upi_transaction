const verifyButton = document.getElementById('verifyUpiBtn');
let verifiedReceiverName = '';

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
        verifiedReceiverName = data.name;
        updatePaymentReview();
      } else {
        result.textContent = data.message;
        result.className = 'form-text text-danger';
        verifiedReceiverName = '';
        updatePaymentReview();
      }
    } catch (error) {
      result.textContent = 'Unable to verify UPI ID.';
      result.className = 'form-text text-danger';
      verifiedReceiverName = '';
      updatePaymentReview();
    }
  });
}

const paymentForm = document.getElementById('paymentForm');
const sourceAccount = document.getElementById('sourceAccount');
const amountInput = document.getElementById('paymentAmount');
const receiverInput = document.getElementById('receiverUpiId');
const balanceHint = document.getElementById('accountBalanceHint');
const reviewAmount = document.getElementById('reviewAmount');
const reviewAccount = document.getElementById('reviewAccount');
const reviewReceiver = document.getElementById('reviewReceiver');
const reviewStatus = document.getElementById('reviewStatus');
const togglePinButton = document.getElementById('togglePinBtn');
const pinInput = document.getElementById('upiPin');

function updatePaymentReview() {
  if (!paymentForm) {
    return;
  }

  const selectedAccount = sourceAccount.options[sourceAccount.selectedIndex];
  const amount = Number(amountInput.value || 0);
  const receiverUpi = receiverInput.value.trim();
  const bankName = selectedAccount ? selectedAccount.dataset.bank : '';
  const balance = selectedAccount ? selectedAccount.dataset.balance : '';

  if (balanceHint && selectedAccount) {
    balanceHint.textContent = `Available balance: Rs. ${balance}`;
  }

  if (reviewAmount) {
    reviewAmount.textContent = `Rs. ${amount.toFixed(2)}`;
  }

  if (reviewAccount) {
    reviewAccount.textContent = selectedAccount ? `${bankName} - ${selectedAccount.value}` : 'Select account';
  }

  if (reviewReceiver) {
    reviewReceiver.textContent = verifiedReceiverName
      ? `${verifiedReceiverName} (${receiverUpi})`
      : receiverUpi || 'Receiver UPI';
  }

  if (reviewStatus) {
    reviewStatus.textContent = verifiedReceiverName ? 'Receiver verified' : 'Verify receiver before paying';
    reviewStatus.className = verifiedReceiverName ? 'text-success' : '';
  }
}

if (paymentForm) {
  document.querySelectorAll('.quick-amounts button').forEach((button) => {
    button.addEventListener('click', () => {
      amountInput.value = button.dataset.amount;
      updatePaymentReview();
    });
  });

  [sourceAccount, amountInput, receiverInput].forEach((field) => {
    if (field) {
      field.addEventListener('input', () => {
        if (field === receiverInput) {
          verifiedReceiverName = '';
          const result = document.getElementById('verifyResult');
          if (result) {
            result.textContent = '';
            result.className = 'form-text';
          }
        }
        updatePaymentReview();
      });
      field.addEventListener('change', updatePaymentReview);
    }
  });

  if (togglePinButton && pinInput) {
    togglePinButton.addEventListener('click', () => {
      const shouldShow = pinInput.type === 'password';
      pinInput.type = shouldShow ? 'text' : 'password';
      togglePinButton.textContent = shouldShow ? 'Hide' : 'Show';
    });
  }

  updatePaymentReview();
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
