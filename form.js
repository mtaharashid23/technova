/**
 * Stratrix Technology - Final Form Handler
 * Handles both #contactForm and .modal-form with real PHP submission
 */

document.addEventListener('DOMContentLoaded', () => {
    
    console.log('🚀 Stratrix Technology Form Handler Loaded');

    // ===== MODAL FORM =====
    const modalForm = document.getElementById('modalForm');
    const modalSubmitBtn = document.getElementById('modalSubmitBtn');
    
    if (modalForm && modalSubmitBtn) {
        modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSubmit(modalForm, modalSubmitBtn, 'modal');
        });
    }

    // ===== CONTACT FORM =====
    const contactForm = document.getElementById('contactForm');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    
    if (contactForm && contactSubmitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSubmit(contactForm, contactSubmitBtn, 'contact');
        });
    }

    // ===== UNIVERSAL HANDLER =====
    async function handleSubmit(form, btn, formType) {
        const originalBtnText = btn.innerHTML;
        
        // Get values by name attribute
        const getData = (name) => {
            const field = form.querySelector(`[name="${name}"]`);
            return field ? field.value.trim() : '';
        };

        const payload = {
            formType: formType,
            name: getData('name'),
            email: getData('email'),
            phone: getData('phone'),
            service: getData('service'),
            company: getData('company'),
            message: getData('message'),
            pageUrl: window.location.href,
            timestamp: new Date().toISOString()
        };

        console.log(`📦 ${formType} form data:`, payload);

        // Validation
        if (!payload.name || payload.name.length < 2) {
            showNotification('Please enter your full name.', 'error');
            return;
        }
        if (!payload.email || !isValidEmail(payload.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Loading state
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending...';
        btn.disabled = true;

        try {
            const response = await fetch('submit.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('📥 Server response:', result);

            if (result.success) {
                showNotification('✅ Message sent successfully! We will contact you soon.', 'success');
                form.reset();

                // Close modal if applicable
                if (formType === 'modal') {
                    setTimeout(() => {
                        const modal = document.getElementById('modalOverlay');
                        if (modal) {
                            modal.classList.remove('active');
                            document.body.style.overflow = '';
                        }
                    }, 1500);
                }
            } else {
                showNotification('❌ ' + (result.message || 'Something went wrong. Please try again.'), 'error');
            }
        } catch (err) {
            console.error('💥 Fetch error:', err);
            showNotification('❌ Network error. Please check your connection.', 'error');
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    }

    // ===== EMAIL VALIDATION =====
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ===== TOAST NOTIFICATION =====
    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.toast-notif');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notif';
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        toast.style.cssText = `
            position: fixed; top: 25px; right: 25px; padding: 16px 24px; border-radius: 12px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #b91c1c)'};
            color: white; font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 500;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 99999; display: flex; align-items: center; gap: 10px;
            animation: slideIn 0.3s ease forwards; max-width: 350px;
        `;

        document.body.appendChild(toast);

        const duration = type === 'success' ? 3500 : 5000;
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
        }, duration);
    }

    // ===== ADD ANIMATIONS =====
    if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    // ===== MODAL OPEN/CLOSE LOGIC (Your existing code - kept as is) =====
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');

    document.querySelectorAll('.open-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            if (type === 'consultation') {
                modalTitle.textContent = 'Get Free Consultation';
                modalSubtitle.textContent = 'Fill in the details and we\'ll get back to you within 24 hours.';
            } else if (type === 'quote') {
                modalTitle.textContent = 'Request a Quote';
                modalSubtitle.textContent = 'Tell us about your project and we\'ll send you a detailed quote.';
            }
            if (modalOverlay) {
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
});