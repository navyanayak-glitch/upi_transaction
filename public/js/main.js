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
