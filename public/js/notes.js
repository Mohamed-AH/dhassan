// Notes page JavaScript

// Delete note function
async function deleteNote(noteId) {
  if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
    return;
  }

  try {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      alert('تم حذف الملاحظة بنجاح');
      window.location.reload();
    } else {
      alert('حدث خطأ: ' + (data.errors ? data.errors.join(', ') : 'فشل الحذف'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال');
  }
}

// Edit note function (placeholder - would open a modal in full implementation)
function editNote(noteId) {
  alert('ميزة التعديل قيد التطوير. معرف الملاحظة: ' + noteId);
  // In full implementation, this would open a modal with the note content
  // and allow editing similar to the write page
}

// Fade in animations
document.addEventListener('DOMContentLoaded', () => {
  const noteCards = document.querySelectorAll('.note-card-full');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  });

  noteCards.forEach(card => observer.observe(card));
});
