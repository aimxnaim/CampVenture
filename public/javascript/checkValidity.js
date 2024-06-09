document.querySelector('form').addEventListener('submit', function(e) {
    if (!this.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      const submitButton = document.querySelector('button[type="submit"]');
      submitButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span >Loading...</span>
      `;
      submitButton.disabled = true;
    }
    this.classList.add('was-validated');
  });