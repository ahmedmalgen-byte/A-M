// 1. بيانات الاتصال (ضع الـ anon key الذي يبدأ بـ eyJhbGci... هنا)
const SUPABASE_URL = "https://hpoihcnvjaqnkgtvryam.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwb2loY252amFxbmtndHZyeWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NTM3OTUsImV4cCI6MjEwMDMyOTc5NX0.dxyIR5xPaZsUysn0FEVpo6gIcOooQ--p_iPT9oe6Y2E";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. دالة جلب الصور تلقائياً من Storage
async function fetchGalleryImages() {
  const galleryContainer = document.getElementById("gallery-container");
  const bucketName = "moments"; // اسم المجلد في Supabase

  // جلب قائمة الصور المرفوعة
  const { data, error } = await supabaseClient.storage
    .from(bucketName)
    .list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "asc" },
    });

  if (error) {
    console.error("Error fetching images:", error);
    return;
  }

  // فرّغ الحاوية الأول
  galleryContainer.innerHTML = "";

  // لو مفيش صور مرفوعة
  if (!data || data.length === 0) {
    console.warn("No images found in the bucket.");
    return;
  }

  // إنشاء كارت لكل صورة تم جلبها مع تجاهل الملفات المخفية
  data.forEach((file) => {
    if (!file.name.startsWith(".")) {
      const { data: publicUrlData } = supabaseClient.storage
        .from(bucketName)
        .getPublicUrl(file.name);

      if (publicUrlData && publicUrlData.publicUrl) {
        const card = document.createElement("div");
        // ضفنا كلاس appear مباشرة عشان يضمن ظهور الصور فوراً حتى لو الأنيميشن معلق
        card.className = "photo-card appear";
        card.innerHTML = `<img src="${publicUrlData.publicUrl}" alt="Moment">`;
        galleryContainer.appendChild(card);
      }
    }
  });

  // تفعيل تأثير التمرير
  initScrollObserver();
}

// دالة تحريك الصور عند التمرير (Scroll Animation)
function initScrollObserver() {
  const photoCards = document.querySelectorAll(".gallery-section .photo-card");

  const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px 50px 0px",
  };

  const appearOnScroll = new IntersectionObserver(function (
    entries,
    appearOnScroll,
  ) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("appear");
        appearOnScroll.unobserve(entry.target);
      }
    });
  }, appearOptions);

  photoCards.forEach((card) => {
    appearOnScroll.observe(card);
  });
}

// تشغيل جلب الصور تلقائياً فور تحميل الصفحة
window.addEventListener("DOMContentLoaded", fetchGalleryImages);
