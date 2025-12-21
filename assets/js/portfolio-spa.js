document.addEventListener("DOMContentLoaded", function () {
  // Portfolio Filtering Logic
  const initPortfolioFilters = () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");

    if (filterButtons.length > 0) {
      filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
          // Remove active class from all buttons
          filterButtons.forEach((btn) => btn.classList.remove("active"));
          // Add active class to current button
          this.classList.add("active");

          const filterValue = this.getAttribute("data-filter");

          portfolioItems.forEach((item) => {
            if (
              filterValue === "all" ||
              item.getAttribute("data-category") === filterValue
            ) {
              item.classList.remove("hide");
            } else {
              item.classList.add("hide");
            }
          });
        });
      });
    }
  };

  // Featured Sites Tabs Logic
  const initPackageTabs = () => {
    const packageTabs = document.querySelectorAll(".package-tab");
    const sitesLists = document.querySelectorAll(".sites-list");

    if (packageTabs.length > 0) {
      packageTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
          packageTabs.forEach((t) => t.classList.remove("active"));
          sitesLists.forEach((list) => list.classList.remove("active"));

          this.classList.add("active");
          const packageValue = this.getAttribute("data-package");
          const targetList = document.getElementById(`${packageValue}-sites`);
          if (targetList) {
            targetList.classList.add("active");
          }
        });
      });
    }
  };

  // Video Gallery Logic
  const initVideoGallery = () => {
    const videoThumbnails = document.querySelectorAll(".video-thumbnail");

    videoThumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        const videoSource = this.querySelector("video")?.src;
        if (!videoSource) return;

        // Create modal
        const modal = document.createElement("div");
        modal.className = "video-modal";
        modal.innerHTML = `
                    <div class="video-modal-content">
                        <button class="video-modal-close">
                            <svg class="svg-icon" viewBox="0 0 352 512" aria-hidden="true" style="width:1em;height:1em;">
                                <use xlink:href="assets/images/icons.svg#icon-times"></use>
                            </svg>
                        </button>
                        <video src="${videoSource}" controls autoplay></video>
                    </div>
                    <style>
                        .video-modal {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.9);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 10000;
                        }
                        .video-modal-content {
                            position: relative;
                            width: 90%;
                            max-width: 1000px;
                        }
                        .video-modal-close {
                            position: absolute;
                            top: -40px;
                            right: 0;
                            background: none;
                            border: none;
                            color: white;
                            font-size: 2rem;
                            cursor: pointer;
                        }
                        .video-modal video {
                            width: 100%;
                            border-radius: 8px;
                        }
                    </style>
                `;

        document.body.appendChild(modal);

        modal.querySelector(".video-modal-close").onclick = () => {
          document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
          if (e.target === modal) {
            document.body.removeChild(modal);
          }
        };
      });
    });
  };

  // Initialize all logic
  initPortfolioFilters();
  initPackageTabs();
  initVideoGallery();

  // Re-initialize logic if needed when SPA section becomes active
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#portfolio") {
      // Some heavy scripts might need re-init or check
    }
  });
});
