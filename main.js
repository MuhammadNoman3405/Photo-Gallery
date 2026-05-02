const images = [
    { src: 'Website project/images/nature 01.jpg', title: 'Serene Landscape', category: 'nature' },
    { src: 'Website project/images/nature 03.jpg', title: 'Mountain Peaks', category: 'nature' },
    { src: 'Website project/images/nature 04.jpg', title: 'Forest Path', category: 'nature' },
    { src: 'Website project/images/1.jpg', title: 'Wild Elegance', category: 'animal' },
    { src: 'Website project/images/2.jpg', title: 'Jungle King', category: 'animal' },
    { src: 'Website project/images/his 1.jpg', title: 'Ancient Echoes', category: 'historical' },
    { src: 'Website project/images/nature 05.jpg', title: 'Golden Hour', category: 'nature' },
    { src: 'Website project/images/3.jpg', title: 'Hidden Valley', category: 'nature' },
    { src: 'Website project/images/4.jpg', title: 'Wildlife Close-up', category: 'animal' },
    { src: 'Website project/images/5.jpg', title: 'Historic Majesty', category: 'historical' },
    { src: 'Website project/images/nature 06.jpg', title: 'Ocean Breeze', category: 'nature' },
    { src: 'Website project/images/6.jpg', title: 'Tropical Paradise', category: 'nature' },
    { src: 'Website project/images/7.jpg', title: 'Graceful Birds', category: 'animal' },
    { src: 'Website project/images/8.jpg', title: 'Epic Monuments', category: 'historical' },
    { src: 'Website project/images/nature 07.jpg', title: 'Misty Mornings', category: 'nature' },
];

const galleryGrid = document.getElementById('galleryGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const downloadLink = document.getElementById('downloadLink');
const closeLightbox = document.querySelector('.close-lightbox');

// Load Images
function loadGallery(category = 'all') {
    galleryGrid.innerHTML = '';
    const filtered = category === 'all' ? images : images.filter(img => img.category === category);

    filtered.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.innerHTML = `
            <div class="photo-wrapper">
                <img src="${img.src}" alt="${img.title}" loading="lazy">
            </div>
            <div class="photo-info">
                <h3>${img.title}</h3>
                <div class="actions">
                    <a href="${img.src}" download="${img.title}.jpg" class="btn-download">Download</a>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-download')) {
                e.preventDefault();
                downloadImage(img.src, `${img.title}.jpg`);
            } else {
                openFullView(img.src);
            }
        });

        // 3D Tilt Effect
        card.addEventListener('mousemove', (e) => handleTilt(e, card));
        card.addEventListener('mouseleave', () => resetTilt(card));

        galleryGrid.appendChild(card);
    });
}

// 3D Tilt Logic
function handleTilt(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
}

function resetTilt(card) {
    card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
}

// Lightbox
function openFullView(src) {
    lightboxImg.src = src;
    downloadLink.dataset.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

downloadLink.addEventListener('click', (e) => {
    e.preventDefault();
    const src = downloadLink.dataset.src;
    // Extract a filename from the src or generate a default one
    const filename = src.split('/').pop() || 'download.jpg';
    downloadImage(src, filename);
});

function downloadImage(url, filename) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.blob();
        })
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        })
        .catch((error) => {
            console.warn('Fetch failed (likely due to file:// protocol), opening in new tab instead:', error);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
}

closeLightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadGallery(btn.dataset.category);
    });
});

// Initial Load
loadGallery();

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 5%';
        nav.style.background = 'rgba(5, 5, 5, 0.95)';
    } else {
        nav.style.padding = '1.5rem 5%';
        nav.style.background = 'rgba(5, 5, 5, 0.8)';
    }
});
