// Write page JavaScript

// Character counter
const contentTextarea = document.getElementById('content');
const charCount = document.getElementById('char-count');

if (contentTextarea && charCount) {
  contentTextarea.addEventListener('input', () => {
    const length = contentTextarea.value.length;
    charCount.textContent = `${length} / 10000`;

    if (length > 10000) {
      charCount.style.color = '#c44';
    } else {
      charCount.style.color = 'var(--light-green)';
    }
  });
}

// Form submission
const noteForm = document.getElementById('note-form');
const formMessage = document.getElementById('form-message');

if (noteForm) {
  noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value;
    const tags = document.getElementById('tags').value;

    // Validation
    if (!title || title.trim().length === 0) {
      showMessage('الرجاء إدخال عنوان الملاحظة', 'error');
      return;
    }

    if (!content || content.trim().length < 10) {
      showMessage('يجب أن تكون الملاحظة 10 أحرف على الأقل', 'error');
      return;
    }

    if (content.trim().length > 10000) {
      showMessage('يجب أن تكون الملاحظة أقل من 10000 حرف', 'error');
      return;
    }

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          content: content.trim(),
          tags: tags.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('تم نشر الملاحظة بنجاح! جاري التحويل...', 'success');
        setTimeout(() => {
          window.location.href = '/notes';
        }, 1500);
      } else {
        showMessage('حدث خطأ: ' + (data.errors ? data.errors.join(', ') : 'فشل النشر'), 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('حدث خطأ في الاتصال بالخادم', 'error');
    }
  });
}

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
  formMessage.style.display = 'block';

  // Scroll to message
  formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Hide after 5 seconds if success
  if (type === 'success') {
    setTimeout(() => {
      formMessage.style.display = 'none';
    }, 5000);
  }
}
