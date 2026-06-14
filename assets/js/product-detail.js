// Advanced gallery carousel, swipe & zoom logic
const mainImage = document.getElementById('main-product-image');
const thumbnailBtns = document.querySelectorAll('.thumbnail-btn');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const viewport = document.getElementById('main-image-viewport');

// Lightbox DOM elements
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxWrapper = document.getElementById('lightbox-img-wrapper');

// Collect all images in the gallery
const images = [];
if (thumbnailBtns.length > 0) {
  thumbnailBtns.forEach(btn => images.push(btn.getAttribute('data-full-src')));
} else if (mainImage) {
  images.push(mainImage.src);
}

let currentIndex = 0;

// Function to show an image by index
function showImage(index) {
  if (images.length <= 1) return;
  
  if (index < 0) {
    currentIndex = images.length - 1;
  } else if (index >= images.length) {
    currentIndex = 0;
  } else {
    currentIndex = index;
  }
  
  const newSrc = images[currentIndex];
  
  // Update src immediately to prevent sync lag with clicks
  mainImage.src = newSrc;
  
  // Soft fade transition
  mainImage.style.opacity = '0.3';
  
  setTimeout(() => {
    mainImage.style.opacity = '1';
  }, 50);
  
  // Update thumbnail highlights
  thumbnailBtns.forEach((btn, idx) => {
    if (idx === currentIndex) {
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } else {
      btn.classList.remove('active');
    }
  });
}

// Thumbnails click events
thumbnailBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    showImage(index);
  });
});

// Carousel Next/Prev Arrow clicks
if (prevBtn) {
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent opening lightbox
    showImage(currentIndex - 1);
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent opening lightbox
    showImage(currentIndex + 1);
  });
}

// Touch Swipe Navigation for mobile
if (viewport && images.length > 1) {
  let touchStartX = 0;
  let touchEndX = 0;
  
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      showImage(currentIndex + 1); // Swipe left
    } else if (touchEndX > touchStartX + swipeThreshold) {
      showImage(currentIndex - 1); // Swipe right
    }
  }
}

// --- Lightbox Modal (Popin) Logic ---
if (viewport && lightboxModal && lightboxImg) {
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  // Function to update image inside lightbox & sync with main carousel
  function showLightboxImage(index) {
    if (images.length <= 1) return;
    
    // Calculate correct index
    if (index < 0) {
      currentIndex = images.length - 1;
    } else if (index >= images.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    
    // Update lightbox image
    lightboxImg.src = images[currentIndex];
    
    // Reset zoom
    lightboxWrapper.classList.remove('zoomed');
    lightboxImg.style.transform = '';
    lightboxImg.style.transformOrigin = 'center center';
    
    // Sync main catalog carousel behind the popup
    showImage(currentIndex);
  }

  // Open Lightbox when clicking anywhere on the main viewport, except on arrows
  viewport.addEventListener('click', (e) => {
    if (e.target.closest('.carousel-arrow')) return;
    
    lightboxImg.src = mainImage.src;
    lightboxWrapper.classList.remove('zoomed');
    lightboxImg.style.transform = '';
    lightboxImg.style.transformOrigin = 'center center';
    
    // Set display to flex to make it part of layout
    lightboxModal.style.display = 'flex';
    // Force a layout reflow so the opacity transition triggers
    lightboxModal.offsetHeight;
    
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  // Lightbox Arrow click events
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent modal from closing
      showLightboxImage(currentIndex - 1);
    });
  }

  // Lightbox Next Arrow click events
  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent modal from closing
      showLightboxImage(currentIndex + 1);
    });
  }

  // Touch Swipe inside Lightbox for mobile devices
  if (images.length > 1) {
    let lbStartX = 0;
    let lbEndX = 0;
    
    lightboxModal.addEventListener('touchstart', (e) => {
      lbStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightboxModal.addEventListener('touchend', (e) => {
      lbEndX = e.changedTouches[0].screenX;
      handleLightboxSwipe();
    }, { passive: true });
    
    function handleLightboxSwipe() {
      const swipeThreshold = 50;
      if (lbEndX < lbStartX - swipeThreshold) {
        showLightboxImage(currentIndex + 1); // Swipe left -> Next
      } else if (lbEndX > lbStartX + swipeThreshold) {
        showLightboxImage(currentIndex - 1); // Swipe right -> Prev
      }
    }
  }

  // Close Lightbox
  function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
    lightboxWrapper.classList.remove('zoomed');
    lightboxImg.style.transform = '';
    
    // Physically hide from page layout after opacity transition ends
    setTimeout(() => {
      if (!lightboxModal.classList.contains('active')) {
        lightboxModal.style.display = 'none';
      }
    }, 300); // matches the 0.3s transition
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  // Close on clicking backdrop/container
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target.classList.contains('lightbox-container')) {
      closeLightbox();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Toggle Zoom and mouse-tracking Pan
  if (lightboxWrapper && lightboxImg) {
    lightboxWrapper.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent modal from closing
      const isZoomed = lightboxWrapper.classList.toggle('zoomed');
      
      if (isZoomed) {
        panImage(e);
      } else {
        lightboxImg.style.transformOrigin = 'center center';
      }
    });

    lightboxWrapper.addEventListener('mousemove', (e) => {
      if (lightboxWrapper.classList.contains('zoomed')) {
        panImage(e);
      }
    });

    function panImage(e) {
      const rect = lightboxWrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      lightboxImg.style.transformOrigin = `${x}% ${y}%`;
    }
  }
}

// Copy to clipboard logic
const copyBtn = document.getElementById('copy-link-btn');
const copyBtnText = document.getElementById('copy-btn-text');

if (copyBtn && copyBtnText) {
  copyBtn.addEventListener('click', async () => {
    const link = copyBtn.getAttribute('data-link');
    try {
      await navigator.clipboard.writeText(link);
      copyBtnText.textContent = 'Link Copied!';
      copyBtn.style.borderColor = 'var(--success, #10b981)';
      copyBtn.style.color = '#10b981';
      
      setTimeout(() => {
        copyBtnText.textContent = 'Copy Link';
        copyBtn.style.borderColor = 'var(--border-color)';
        copyBtn.style.color = 'var(--text-primary)';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      const tempInput = document.createElement('input');
      tempInput.value = link;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      copyBtnText.textContent = 'Link Copied!';
      copyBtn.style.borderColor = 'var(--success, #10b981)';
      copyBtn.style.color = '#10b981';
      
      setTimeout(() => {
        copyBtnText.textContent = 'Copy Link';
        copyBtn.style.borderColor = 'var(--border-color)';
        copyBtn.style.color = 'var(--text-primary)';
      }, 2000);
    }
  });
}
