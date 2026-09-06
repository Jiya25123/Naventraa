// ========================================
// NAVENTRA NOTIFICATION HELPER
// ========================================

async function createNotification(notificationData) {

    try {

        var result =
            await supabaseClient
                .from("notifications")
                .insert({
                    user_id:
                        notificationData.userId,

                    title:
                        notificationData.title,

                    message:
                        notificationData.message,

                    type:
                        notificationData.type,

                    priority:
                        notificationData.priority || "normal",

                    is_read:
                        false,

                    link:
                        notificationData.link || null,

                    related_id:
                        notificationData.relatedId || null,

                    related_type:
                        notificationData.relatedType || null,

                    expires_at:
                        notificationData.expiresAt || null
                });


        if (result.error) {

            console.error(
                "Could not create notification:",
                result.error
            );

            return false;

        }


        return true;

    } catch (error) {

        console.error(
            "Notification creation error:",
            error
        );

        return false;

    }

}


// ========================================
// NAVENTRA TEACHER DASHBOARD NAVIGATION
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    var sidebarLinks =
        document.querySelectorAll(".teacher-sidebar-link");

    var sections =
        document.querySelectorAll(".teacher-section");

    var pageTitle =
        document.getElementById("teacherPageTitle");

    var sidebar =
        document.getElementById("teacherSidebar");

    var menuButton =
        document.getElementById("teacherMenuBtn");


    // ========================================
    // SWITCH TEACHER PAGE
    // ========================================

    function showTeacherPage(pageId, title) {

        // Hide all sections
        sections.forEach(function (section) {

            section.classList.remove("active");

        });


        // Show selected section
        var selectedSection =
            document.getElementById(pageId);

        if (selectedSection) {

            selectedSection.classList.add("active");

        }


        // Remove active from all menu buttons
        sidebarLinks.forEach(function (link) {

            link.classList.remove("active");

        });


        // Add active to selected menu button
        var selectedLink =
            document.querySelector(
                '.teacher-sidebar-link[data-page="' +
                pageId +
                '"]'
            );

        if (selectedLink) {

            selectedLink.classList.add("active");

        }


        // Change header title
        if (pageTitle) {

            pageTitle.textContent =
                title || "Dashboard";

        }


        // Close mobile sidebar
        if (sidebar) {

            sidebar.classList.remove("open");

        }


        window.scrollTo(0, 0);

    }


    // ========================================
    // SIDEBAR BUTTONS
    // ========================================

    sidebarLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                var pageId =
                    link.getAttribute("data-page");

                var title =
                    link.getAttribute("data-title");


                if (!pageId) {
                    return;
                }


                showTeacherPage(
                    pageId,
                    title
                );

            }
        );

    });


    // ========================================
    // QUICK ACTION BUTTONS
    // ========================================

    var quickButtons =
        document.querySelectorAll(
            ".teacher-action-card, .teacher-view-all-btn"
        );


    quickButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                var pageId =
                    button.getAttribute("data-page");


                if (!pageId) {
                    return;
                }


                var link =
                    document.querySelector(
                        '.teacher-sidebar-link[data-page="' +
                        pageId +
                        '"]'
                    );


                var title = "Dashboard";


                if (link) {

                    title =
                        link.getAttribute("data-title") ||
                        "Dashboard";

                }


                showTeacherPage(
                    pageId,
                    title
                );

            }
        );

    });


    // ========================================
    // MOBILE MENU
    // ========================================

    if (menuButton && sidebar) {

        menuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle("open");

            }
        );

    }


    // ========================================
    // INITIAL PAGE
    // ========================================

    showTeacherPage(
        "teacher-dashboard",
        "Dashboard"
    );


    console.log(
        "Teacher Portal navigation loaded successfully."
    );

});

// ========================================
// TEACHER LOST & FOUND
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        var lostItemsGrid =
            document.getElementById(
                "teacherLostItemsGrid"
            );

        if (!lostItemsGrid) {
            return;
        }


        var searchInput =
            document.getElementById(
                "teacherLostItemSearch"
            );

        var categoryFilter =
            document.getElementById(
                "teacherLostItemCategory"
            );

        var statusFilter =
            document.getElementById(
                "teacherLostItemStatus"
            );

        var itemCount =
            document.getElementById(
                "teacherLostItemCount"
            );


        var teacherLostItems = [];


        // ========================================
        // LOAD ITEMS
        // ========================================

        async function loadTeacherLostItems() {

            lostItemsGrid.innerHTML = `
                <div class="teacher-loading-state">
                    Loading Lost & Found items...
                </div>
            `;


            try {

                var result =
                    await supabaseClient
                        .from("lost_items")
                        .select("*")
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );


                var items = result.data;
                var error = result.error;


                if (error) {

                    console.error(
                        "Could not load Lost & Found items:",
                        error
                    );


                    lostItemsGrid.innerHTML = `
                        <div class="teacher-empty-state">
                            <div>⚠️</div>

                            <h3>
                                Could not load items
                            </h3>

                            <p>
                                Please try refreshing the page.
                            </p>
                        </div>
                    `;

                    return;
                }


                teacherLostItems =
                    items || [];


                renderTeacherLostItems();

            } catch (error) {

                console.error(
                    "Lost & Found loading error:",
                    error
                );


                lostItemsGrid.innerHTML = `
                    <div class="teacher-empty-state">
                        <div>⚠️</div>

                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            Please try again.
                        </p>
                    </div>
                `;

            }

        }


        // ========================================
        // CREATE ITEM CARD
        // ========================================

        function createTeacherLostItemCard(item) {

            var status =
                item.status || "Found";


            var statusClass =
                status
                    .toLowerCase()
                    .replace(/\s+/g, "-");


            var imageHTML =
                item.image_url
                    ? `
                        <img
                            src="${item.image_url}"
                            alt="${item.item_name || "Found item"}"
                            class="teacher-lost-item-image"
                        >
                    `
                    : `
                        <div class="teacher-lost-item-image-placeholder">
                            📦
                        </div>
                    `;


            return `

                <article
                    class="teacher-lost-item-card"
                >

                    <div class="teacher-lost-item-image-wrap">

                        ${imageHTML}

                        <span
                            class="teacher-item-status ${statusClass}"
                        >
                            ${status}
                        </span>

                    </div>


                    <div class="teacher-lost-item-content">

                        <span class="teacher-item-category">
                            ${item.category || "Other"}
                        </span>


                        <h3>
                            ${item.item_name || "Unnamed Item"}
                        </h3>


                        <p>
                            ${
                                item.description ||
                                "No description provided."
                            }
                        </p>


                        <div class="teacher-lost-item-meta">

                            <span>
                                📍
                                ${item.location_found || "Unknown location"}
                            </span>

                            <span>
                                📅
                                ${item.date_found || "Unknown date"}
                            </span>

                        </div>


                        ${
                            item.additional_notes
                            ? `
                                <div class="teacher-item-notes">
                                    📝 ${item.additional_notes}
                                </div>
                            `
                            : ""
                        }


                        <div class="teacher-lost-item-actions">

                            <button
                                type="button"
                                class="teacher-secondary-btn"
                                data-item-id="${item.id}"
                            >
                                View Details
                            </button>


                            ${
                                status.toLowerCase() ===
                                "claim pending"
                                ? `
                                    <button
                                        type="button"
                                        class="teacher-primary-small-btn"
                                        data-page="teacher-claims"
                                    >
                                        View Claim
                                    </button>
                                `
                                : ""
                            }

                        </div>

                    </div>

                </article>

            `;

        }


        // ========================================
        // RENDER ITEMS
        // ========================================

        function renderTeacherLostItems() {

            var searchTerm =
                searchInput
                    ? searchInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            var selectedCategory =
                categoryFilter
                    ? categoryFilter.value
                    : "all";


            var selectedStatus =
                statusFilter
                    ? statusFilter.value
                    : "all";


            var filteredItems =
                teacherLostItems.filter(
                    function (item) {

                        var searchableText = `

                            ${item.item_name || ""}

                            ${item.category || ""}

                            ${item.description || ""}

                            ${item.location_found || ""}

                            ${item.additional_notes || ""}

                        `.toLowerCase();


                        var matchesSearch =
                            !searchTerm ||
                            searchableText.includes(
                                searchTerm
                            );


                        var matchesCategory =
                            selectedCategory === "all" ||
                            (
                                item.category || ""
                            ).toLowerCase() ===
                            selectedCategory.toLowerCase();


                        var matchesStatus =
                            selectedStatus === "all" ||
                            (
                                item.status || ""
                            ).toLowerCase() ===
                            selectedStatus.toLowerCase();


                        return (
                            matchesSearch &&
                            matchesCategory &&
                            matchesStatus
                        );

                    }
                );


            if (itemCount) {

                itemCount.textContent =
                    filteredItems.length +
                    (
                        filteredItems.length === 1
                            ? " item"
                            : " items"
                    );

            }


            if (!filteredItems.length) {

                lostItemsGrid.innerHTML = `

                    <div class="teacher-empty-state">

                        <div>
                            🔍
                        </div>

                        <h3>
                            No items found
                        </h3>

                        <p>
                            Try changing your search or filters.
                        </p>

                    </div>

                `;

                return;
            }


            lostItemsGrid.innerHTML =
                filteredItems
                    .map(
                        createTeacherLostItemCard
                    )
                    .join("");

        }


        // ========================================
        // SEARCH
        // ========================================

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                renderTeacherLostItems
            );

        }


        // ========================================
        // CATEGORY FILTER
        // ========================================

        if (categoryFilter) {

            categoryFilter.addEventListener(
                "change",
                renderTeacherLostItems
            );

        }


        // ========================================
        // STATUS FILTER
        // ========================================

        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                renderTeacherLostItems
            );

        }


        // ========================================
        // START
        // ========================================

        loadTeacherLostItems();

    }
);

// ========================================
// NAVENTRA TEACHER - UPLOAD FOUND ITEM
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    var uploadForm =
        document.getElementById("teacherUploadItemForm");

    if (!uploadForm) {
        return;
    }


    var uploadMessage =
        document.getElementById("teacherUploadMessage");


    uploadForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ========================================
            // GET CURRENT TEACHER
            // ========================================

            var userResult =
                await supabaseClient.auth.getUser();

            var user = userResult.data.user;
            var userError = userResult.error;


            if (userError || !user) {

                showUploadMessage(
                    "Please log in again before uploading an item.",
                    "error"
                );

                return;
            }


            // ========================================
            // GET FORM VALUES
            // ========================================

            var itemName =
                document.getElementById(
                    "teacherItemName"
                ).value.trim();


            var category =
                document.getElementById(
                    "teacherItemCategory"
                ).value;


            var locationFound =
                document.getElementById(
                    "teacherItemLocation"
                ).value;


            var dateFound =
                document.getElementById(
                    "teacherItemDate"
                ).value;


            var description =
                document.getElementById(
                    "teacherItemDescription"
                ).value.trim();


            var additionalNotes =
                document.getElementById(
                    "teacherItemNotes"
                ).value.trim();


            
var imageFileInput =
    document.getElementById(
        "teacherItemImage"
    );

var imageFile =
    imageFileInput &&
    imageFileInput.files.length > 0
        ? imageFileInput.files[0]
        : null;




            // ========================================
            // BASIC VALIDATION
            // ========================================

            if (
                !itemName ||
                !category ||
                !locationFound ||
                !dateFound ||
                !description
            ) {

                showUploadMessage(
                    "Please complete all required fields.",
                    "error"
                );

                return;
            }


            // ========================================
            // LOADING STATE
            // ========================================

            var submitButton =
                uploadForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Publishing...";

            }


            showUploadMessage(
                "Publishing found item...",
                "loading"
            );


            try {

               
// ========================================
// UPLOAD IMAGE TO SUPABASE STORAGE
// ========================================

var imageUrl = null;


if (imageFile) {

    var fileExtension =
        imageFile.name
            .split(".")
            .pop()
            .toLowerCase();


    var fileName =
        user.id +
        "_" +
        Date.now() +
        "." +
        fileExtension;


    var uploadResult =
        await supabaseClient.storage
            .from("lost-items")
            .upload(
                fileName,
                imageFile,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (uploadResult.error) {

        console.error(
            "Could not upload image:",
            uploadResult.error
        );


        showUploadMessage(
            "Could not upload the image. Please try again.",
            "error"
        );

        return;
    }


    var publicUrlResult =
        supabaseClient.storage
            .from("lost-items")
            .getPublicUrl(fileName);


    imageUrl =
        publicUrlResult.data.publicUrl;

}




                // ========================================
                // INSERT INTO LOST_ITEMS
                // ========================================

                var result =
                    await supabaseClient
                        .from("lost_items")
                        .insert([
                            {
                                item_name: itemName,
                                category: category,
                                description: description,
                                location_found: locationFound,
                                date_found: dateFound,
                                image_url: imageUrl || null,
                                status: "Found",
                                uploaded_by: user.id,
                                additional_notes:
                                    additionalNotes || null
                            }
                        ])
                        .select()
                        .single();


                var data = result.data;
                var error = result.error;


                // ========================================
                // HANDLE ERROR
                // ========================================

                if (error) {

                    console.error(
                        "Could not publish found item:",
                        error
                    );


                    showUploadMessage(
                        "Could not publish the item. Please try again.",
                        "error"
                    );


                    return;
                }


                // ========================================
                // SUCCESS
                // ========================================

                console.log(
                    "Found item published successfully:",
                    data
                );


                showUploadMessage(
                    "✓ Found item published successfully!",
                    "success"
                );


                // Reset form

                uploadForm.reset();


                // ========================================
                // GO TO LOST & FOUND
                // ========================================

                setTimeout(
                    function () {

                        var lostFoundButton =
                            document.querySelector(
                                '.teacher-sidebar-link[data-page="teacher-lost-found"]'
                            );


                        if (lostFoundButton) {

                            lostFoundButton.click();

                        }

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "Upload found item error:",
                    error
                );


                showUploadMessage(
                    "Something went wrong. Please try again.",
                    "error"
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "📤 Publish to Lost & Found";

                }

            }

        }
    );


    // ========================================
    // MESSAGE HELPER
    // ========================================

    function showUploadMessage(message, type) {

        if (!uploadMessage) {
            return;
        }


        uploadMessage.textContent =
            message;


        uploadMessage.className =
            "teacher-upload-message " +
            type;

    }

});

// ========================================
// NAVENTRA TEACHER - CLAIM VERIFICATION
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    var claimsList =
        document.getElementById("teacherClaimsList");

    if (!claimsList) {
        return;
    }

    var searchInput =
        document.getElementById("teacherClaimSearch");

    var statusFilter =
        document.getElementById("teacherClaimStatusFilter");

    var claimsCount =
        document.getElementById("teacherClaimsCount");

    var pendingCount =
        document.getElementById("teacherClaimsPendingCount");

    var verifiedCount =
        document.getElementById("teacherClaimsVerifiedCount");

    var rejectedCount =
        document.getElementById("teacherClaimsRejectedCount");


    var teacherClaims = [];


    // ========================================
    // LOAD CLAIMS
    // ========================================

    async function loadTeacherClaims() {

        claimsList.innerHTML = `
            <div class="teacher-loading-state">
                Loading student claims...
            </div>
        `;

        try {

            var result =
                await supabaseClient
                    .from("lost_found_claims")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

            var data = result.data;
            var error = result.error;


            if (error) {

                console.error(
                    "Could not load claims:",
                    error
                );

                claimsList.innerHTML = `
                    <div class="teacher-empty-state">
                        <div>⚠️</div>

                        <h3>
                            Could not load claims
                        </h3>

                        <p>
                            Please try refreshing the page.
                        </p>
                    </div>
                `;

                return;
            }


            teacherClaims = data || [];

            updateClaimStatistics();

            renderTeacherClaims();

        } catch (error) {

            console.error(
                "Claim loading error:",
                error
            );

            claimsList.innerHTML = `
                <div class="teacher-empty-state">
                    <div>⚠️</div>

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        Please try again.
                    </p>
                </div>
            `;

        }

    }


    // ========================================
    // STATISTICS
    // ========================================

    function updateClaimStatistics() {

        var pending = 0;
        var verified = 0;
        var rejected = 0;


        teacherClaims.forEach(function (claim) {

            var status =
                (claim.status || "")
                    .toLowerCase()
                    .trim();


            if (status === "pending") {

                pending++;

            } else if (
                status === "verified"
            ) {

                verified++;

            } else if (
                status === "rejected"
            ) {

                rejected++;

            }

        });


        if (pendingCount) {
            pendingCount.textContent = pending;
        }

        if (verifiedCount) {
            verifiedCount.textContent = verified;
        }

        if (rejectedCount) {
            rejectedCount.textContent = rejected;
        }

    }


    // ========================================
    // CREATE CLAIM CARD
    // ========================================

    function createClaimCard(claim) {

        var status =
            claim.status || "Pending";

        var normalizedStatus =
            status
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-");


        var createdDate =
            claim.created_at
                ? new Date(
                    claim.created_at
                ).toLocaleDateString(
                    undefined,
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                )
                : "Unknown date";


        var actionButtons = "";


        if (
            status.toLowerCase() === "pending"
        ) {

            actionButtons = `

                <div class="teacher-claim-actions">

                    <button
                        type="button"
                        class="teacher-claim-approve-btn"
                        data-claim-id="${claim.id}"
                    >
                        ✓ Approve
                    </button>

                    <button
                        type="button"
                        class="teacher-claim-reject-btn"
                        data-claim-id="${claim.id}"
                    >
                        ✕ Reject
                    </button>

                    <button
                        type="button"
                        class="teacher-claim-info-btn"
                        data-claim-id="${claim.id}"
                    >
                        💬 More Information
                    </button>

                </div>

            `;

        }


        return `

            <article
                class="teacher-claim-card"
                data-claim-id="${claim.id}"
            >

                <div class="teacher-claim-card-top">

                    <div class="teacher-claim-item">

                        <div class="teacher-claim-item-icon">
                            📦
                        </div>

                        <div>

                            <span>
                                CLAIM FOR
                            </span>

                            <h3>
                                ${claim.item_name || "Unnamed Item"}
                            </h3>

                        </div>

                    </div>


                    <span
                        class="teacher-claim-status ${normalizedStatus}"
                    >
                        ${status}
                    </span>

                </div>


                <div class="teacher-claim-details">

                    <div class="teacher-claim-detail">

                        <span>👤</span>

                        <div>
                            <small>Student</small>
                            <strong>
                                ${claim.full_name || "Unknown"}
                            </strong>
                        </div>

                    </div>


                    <div class="teacher-claim-detail">

                        <span>🎓</span>

                        <div>
                            <small>Class</small>
                            <strong>
                                ${claim.class || "Not provided"}
                            </strong>
                        </div>

                    </div>


                    <div class="teacher-claim-detail">

                        <span>📞</span>

                        <div>
                            <small>Contact</small>
                            <strong>
                                ${claim.contact_info || "Not provided"}
                            </strong>
                        </div>

                    </div>


                    <div class="teacher-claim-detail">

                        <span>📅</span>

                        <div>
                            <small>Submitted</small>
                            <strong>
                                ${createdDate}
                            </strong>
                        </div>

                    </div>

                </div>


                <div class="teacher-claim-reason">

                    <span>
                        Why does the student believe this item is theirs?
                    </span>

                    <p>
                        ${claim.reason || "No reason provided."}
                    </p>

                </div>


                ${actionButtons}

            </article>

        `;

    }


    // ========================================
    // RENDER CLAIMS
    // ========================================

    function renderTeacherClaims() {

        var searchTerm =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        var selectedStatus =
            statusFilter
                ? statusFilter.value
                    .toLowerCase()
                : "all";


        var filteredClaims =
            teacherClaims.filter(
                function (claim) {

                    var searchableText = `

                        ${claim.item_name || ""}

                        ${claim.full_name || ""}

                        ${claim.class || ""}

                        ${claim.contact_info || ""}

                        ${claim.reason || ""}

                    `.toLowerCase();


                    var matchesSearch =
                        !searchTerm ||
                        searchableText.includes(
                            searchTerm
                        );


                    var claimStatus =
                        (
                            claim.status || ""
                        )
                            .toLowerCase()
                            .trim();


                    var matchesStatus =
                        selectedStatus === "all" ||
                        claimStatus === selectedStatus;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );


        if (claimsCount) {

            claimsCount.textContent =
                filteredClaims.length +
                (
                    filteredClaims.length === 1
                        ? " claim"
                        : " claims"
                );

        }


        if (!filteredClaims.length) {

            claimsList.innerHTML = `

                <div class="teacher-empty-state">

                    <div>📋</div>

                    <h3>
                        No claims found
                    </h3>

                    <p>
                        There are no claims matching
                        your search or filter.
                    </p>

                </div>

            `;

            return;
        }


        claimsList.innerHTML =
            filteredClaims
                .map(createClaimCard)
                .join("");


        attachClaimActions();

    }


    // ========================================
    // CLAIM ACTIONS
    // ========================================

    function attachClaimActions() {

        var approveButtons =
            document.querySelectorAll(
                ".teacher-claim-approve-btn"
            );

        var rejectButtons =
            document.querySelectorAll(
                ".teacher-claim-reject-btn"
            );

        var infoButtons =
            document.querySelectorAll(
                ".teacher-claim-info-btn"
            );


        approveButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        updateClaimStatus(
                            button.getAttribute(
                                "data-claim-id"
                            ),
                            "verified"
                        );

                    }
                );

            }
        );


        rejectButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        updateClaimStatus(
                            button.getAttribute(
                                "data-claim-id"
                            ),
                            "rejected"
                        );

                    }
                );

            }
        );


        infoButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        requestMoreInformation(
                            button.getAttribute(
                                "data-claim-id"
                            )
                        );

                    }
                );

            }
        );

    }


    // ========================================
    // UPDATE CLAIM STATUS
    // ========================================

    async function updateClaimStatus(
        claimId,
        newStatus
    ) {

        try {

            var result =
                await supabaseClient
                    .from("lost_found_claims")
                    .update({
                        status: newStatus
                    })
                    .eq("id", claimId);


            if (result.error) {

                console.error(
                    "Could not update claim:",
                    result.error
                );

                alert(
                    "Could not update the claim. Please try again."
                );

                return;
            }


            var claim =
                teacherClaims.find(
                    function (item) {
                        return item.id === claimId;
                    }
                );


            if (claim) {
                claim.status = newStatus;
            }


            updateClaimStatistics();

            renderTeacherClaims();

        } catch (error) {

            console.error(
                "Claim update error:",
                error
            );

            alert(
                "Something went wrong. Please try again."
            );

        }

    }


    // ========================================
    // REQUEST MORE INFORMATION
    // ========================================

    async function requestMoreInformation(
        claimId
    ) {

        await updateClaimStatus(
            claimId,
            "more information"
        );

    }


    // ========================================
    // SEARCH + FILTER
    // ========================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderTeacherClaims
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderTeacherClaims
        );

    }


    // ========================================
    // START
    // ========================================

    loadTeacherClaims();

    // ========================================
    // RESOURCES
    // ========================================

    var resourceForm =
        document.getElementById("resourceForm");

    var openResourceFormBtn =
        document.getElementById("openResourceFormBtn");

    var closeResourceFormBtn =
        document.getElementById("closeResourceFormBtn");

    var cancelResourceBtn =
        document.getElementById("cancelResourceBtn");

    var resourceFormCard =
        document.getElementById("resourceFormCard");

    var teacherResourcesList =
        document.getElementById("teacherResourcesList");

    var teacherResourcesCount =
        document.getElementById("teacherResourcesCount");

    var teacherResourceSearch =
        document.getElementById("teacherResourceSearch");

    var teacherResourceCategoryFilter =
        document.getElementById(
            "teacherResourceCategoryFilter"
        );


    var teacherResources = [];


    // ========================================
    // OPEN RESOURCE FORM
    // ========================================

    if (openResourceFormBtn) {

        openResourceFormBtn.addEventListener(
            "click",
            function () {

                resourceFormCard.style.display =
                    "block";

                openResourceFormBtn.style.display =
                    "none";

                resourceFormCard.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }


    // ========================================
    // CLOSE RESOURCE FORM
    // ========================================

    function closeResourceForm() {

        if (resourceFormCard) {

            resourceFormCard.style.display =
                "none";

        }

        if (openResourceFormBtn) {

            openResourceFormBtn.style.display =
                "inline-flex";

        }

    }


    if (closeResourceFormBtn) {

        closeResourceFormBtn.addEventListener(
            "click",
            closeResourceForm
        );

    }


    if (cancelResourceBtn) {

        cancelResourceBtn.addEventListener(
            "click",
            closeResourceForm
        );

    }


    // ========================================
    // LOAD TEACHER RESOURCES
    // ========================================

    async function loadTeacherResources() {

        if (!teacherResourcesList) {
            return;
        }


        teacherResourcesList.innerHTML = `
            <div class="teacher-resources-loading">
                Loading resources...
            </div>
        `;


        try {

            var result =
                await supabaseClient
                    .from("resources")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            var data = result.data;
            var error = result.error;


            if (error) {

                console.error(
                    "Could not load resources:",
                    error
                );

                teacherResourcesList.innerHTML = `
                    <div class="teacher-resources-empty">
                        <div class="teacher-resources-empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Could not load resources
                        </h3>

                        <p>
                            Please refresh the page and try again.
                        </p>
                    </div>
                `;

                return;

            }


            teacherResources =
                data || [];


            renderTeacherResources();


        } catch (error) {

            console.error(
                "Resource loading error:",
                error
            );


            teacherResourcesList.innerHTML = `
                <div class="teacher-resources-empty">
                    <div class="teacher-resources-empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        Please try again.
                    </p>
                </div>
            `;

        }

    }


    // ========================================
    // CREATE RESOURCE CARD
    // ========================================

    function createResourceCard(resource) {

        var resourceDate =
            resource.created_at
                ? new Date(
                    resource.created_at
                ).toLocaleDateString(
                    undefined,
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                )
                : "Unknown date";


        var statusText =
            resource.is_published
                ? "Published"
                : "Draft";


        var statusClass =
            resource.is_published
                ? "published"
                : "draft";


        var resourceLink = "";


        if (resource.file_url) {

            resourceLink = `
                <a
                    href="${resource.file_url}"
                    target="_blank"
                    rel="noopener"
                    class="teacher-resource-open-btn"
                >
                    Open Resource
                </a>
            `;

        } else if (
            resource.external_url
        ) {

            resourceLink = `
                <a
                    href="${resource.external_url}"
                    target="_blank"
                    rel="noopener"
                    class="teacher-resource-open-btn"
                >
                    Open Link
                </a>
            `;

        }


        return `

            <article
                class="teacher-resource-card"
                data-resource-id="${resource.id}"
            >

                <div class="teacher-resource-card-icon">
                    📚
                </div>


                <div class="teacher-resource-card-content">

                    <div class="teacher-resource-card-top">

                        <div>

                            <span class="teacher-resource-category">
                                ${resource.category || "General"}
                            </span>

                            <h3>
                                ${resource.title || "Untitled Resource"}
                            </h3>

                        </div>


                        <span
                            class="teacher-resource-status ${statusClass}"
                        >
                            ${statusText}
                        </span>

                    </div>


                    <p>
                        ${resource.description || "No description provided."}
                    </p>


                    <div class="teacher-resource-meta">

                        <span>
                            📄 ${resource.resource_type || "Resource"}
                        </span>

                        <span>
                            🎓 ${resource.target_audience || "All Students"}
                        </span>

                        <span>
                            📅 ${resourceDate}
                        </span>

                        <span>
                            ⬇️ ${resource.download_count || 0}
                        </span>

                    </div>


                    <div class="teacher-resource-card-actions">

                        ${resourceLink}

                        <button
                            type="button"
                            class="teacher-resource-delete-btn"
                            data-resource-id="${resource.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </article>

        `;

    }


    // ========================================
    // RENDER RESOURCES
    // ========================================

    function renderTeacherResources() {

        if (!teacherResourcesList) {
            return;
        }


        var searchTerm =
            teacherResourceSearch
                ? teacherResourceSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        var selectedCategory =
            teacherResourceCategoryFilter
                ? teacherResourceCategoryFilter.value
                : "all";


        var filteredResources =
            teacherResources.filter(
                function (resource) {

                    var searchableText = `

                        ${resource.title || ""}

                        ${resource.description || ""}

                        ${resource.category || ""}

                        ${resource.resource_type || ""}

                    `.toLowerCase();


                    var matchesSearch =
                        !searchTerm ||
                        searchableText.includes(
                            searchTerm
                        );


                    var matchesCategory =
                        selectedCategory === "all" ||
                        resource.category ===
                        selectedCategory;


                    return (
                        matchesSearch &&
                        matchesCategory
                    );

                }
            );


        if (teacherResourcesCount) {

            teacherResourcesCount.textContent =
                filteredResources.length +
                (
                    filteredResources.length === 1
                        ? " resource"
                        : " resources"
                );

        }


        if (!filteredResources.length) {

            teacherResourcesList.innerHTML = `

                <div class="teacher-resources-empty">

                    <div class="teacher-resources-empty-icon">
                        📚
                    </div>

                    <h3>
                        No resources found
                    </h3>

                    <p>
                        Add a resource to share learning
                        materials with your students.
                    </p>

                </div>

            `;

            return;

        }


        teacherResourcesList.innerHTML =
            filteredResources
                .map(createResourceCard)
                .join("");


        attachResourceActions();

    }


    // ========================================
    // DELETE RESOURCE
    // ========================================

    function attachResourceActions() {

        var deleteButtons =
            document.querySelectorAll(
                ".teacher-resource-delete-btn"
            );


        deleteButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        var resourceId =
                            button.getAttribute(
                                "data-resource-id"
                            );


                        deleteResource(
                            resourceId
                        );

                    }
                );

            }
        );

    }


    async function deleteResource(
        resourceId
    ) {

        var confirmed =
            confirm(
                "Delete this resource?"
            );


        if (!confirmed) {
            return;
        }


        try {

            var result =
                await supabaseClient
                    .from("resources")
                    .delete()
                    .eq("id", resourceId);


            if (result.error) {

                console.error(
                    "Could not delete resource:",
                    result.error
                );

                alert(
                    "Could not delete the resource."
                );

                return;

            }


            teacherResources =
                teacherResources.filter(
                    function (resource) {
                        return resource.id !== resourceId;
                    }
                );


            renderTeacherResources();


        } catch (error) {

            console.error(
                "Resource deletion error:",
                error
            );

            alert(
                "Something went wrong."
            );

        }

    }


    // ========================================
    // SEARCH
    // ========================================

    if (teacherResourceSearch) {

        teacherResourceSearch.addEventListener(
            "input",
            renderTeacherResources
        );

    }


    if (teacherResourceCategoryFilter) {

        teacherResourceCategoryFilter.addEventListener(
            "change",
            renderTeacherResources
        );

    }


    // ========================================
    // UPLOAD RESOURCE
    // ========================================

    if (resourceForm) {

        resourceForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                var title =
                    document.getElementById(
                        "resourceTitle"
                    ).value.trim();


                var description =
                    document.getElementById(
                        "resourceDescription"
                    ).value.trim();


                var category =
                    document.getElementById(
                        "resourceCategory"
                    ).value;


                var resourceType =
                    document.getElementById(
                        "resourceType"
                    ).value;


                var targetAudience =
                    document.getElementById(
                        "resourceAudience"
                    ).value;


                var externalUrl =
                    document.getElementById(
                        "resourceExternalUrl"
                    ).value.trim();


                var fileInput =
                    document.getElementById(
                        "resourceFile"
                    );


                var published =
                    document.getElementById(
                        "resourcePublished"
                    ).checked;


                var file =
                    fileInput.files[0];


                var saveButton =
                    document.getElementById(
                        "saveResourceBtn"
                    );


                try {

                    saveButton.disabled =
                        true;

                    saveButton.textContent =
                        "Uploading...";


                    // Get logged-in teacher
                    var userResult =
                        await supabaseClient.auth.getUser();


                    var user =
                        userResult.data.user;
                        console.log("LOGGED IN USER:", user);
console.log("USER ID:", user ? user.id : null);


                    if (!user) {

                        alert(
                            "You must be logged in."
                        );

                        return;

                    }


                    var fileUrl =
                        null;


                    // ====================================
                    // UPLOAD FILE
                    // ====================================

                    if (file) {

                        var safeFileName =
                            file.name
                                .replace(
                                    /[^a-zA-Z0-9._-]/g,
                                    "_"
                                );


                        var filePath =
                            user.id +
                            "/" +
                            Date.now() +
                            "_" +
                            safeFileName;


                        var uploadResult =
                            await supabaseClient
                                .storage
                                .from("resources")
                                .upload(
                                    filePath,
                                    file
                                );


                        if (uploadResult.error) {

                            console.error(
                                "Resource file upload error:",
                                uploadResult.error
                            );

                            alert(
                                "Could not upload the file."
                            );

                            return;

                        }


                        var publicUrlResult =
                            supabaseClient
                                .storage
                                .from("resources")
                                .getPublicUrl(
                                    filePath
                                );


                        fileUrl =
                            publicUrlResult.data.publicUrl;

                    }


                  

// ====================================
// INSERT RESOURCE
// ====================================

var insertResult =
    await supabaseClient
        .from("resources")
        .insert({

                                title:
                                    title,

                                description:
                                    description,

                                category:
                                    category,

                                resource_type:
                                    resourceType,

                                file_url:
                                    fileUrl,

                                external_url:
                                    externalUrl ||
                                    null,

                                uploaded_by:
                                    user.id,

                                target_audience:
                                    targetAudience,

                                is_published:
                                    published,

                                download_count:
                                    0

                            })
                            .select()
                            .single();


                    if (insertResult.error) {

                        console.error(
                            "Could not create resource:",
                            insertResult.error
                        );

                        alert(
                            "Could not publish the resource."
                        );

                        return;

                    }


                    teacherResources.unshift(
    insertResult.data
);


// ====================================
// CREATE RESOURCE NOTIFICATION
// ====================================

var studentsResult =
    await supabaseClient
        .from("profiles")
        .select("id")
        .eq("role", "student");


if (studentsResult.error) {

    console.error(
        "Could not load students for notification:",
        studentsResult.error
    );

} else {

    var students =
        studentsResult.data || [];


    for (var i = 0; i < students.length; i++) {

        await createNotification({

            userId:
                students[i].id,

            title:
                "📚 New Resource Available",

            message:
                `"${title}" has been published and is now available in Resources.`,

            type:
                "resource",

            priority:
                "normal",

            link:
                "resources",

            relatedId:
                insertResult.data.id,

            relatedType:
                "resource"

        });

    }

}


renderTeacherResources();


                    resourceForm.reset();


                    document.getElementById(
                        "resourcePublished"
                    ).checked = true;


                    closeResourceForm();


                    alert(
                        "Resource published successfully!"
                    );


                } catch (error) {

                    console.error(
                        "Resource upload error:",
                        error
                    );

                    alert(
                        "Something went wrong while uploading the resource."
                    );

                } finally {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Publish Resource";

                }

            }
        );

    }


    // ========================================
    // START RESOURCES
    // ========================================

    loadTeacherResources();

});

// ========================================
// NAVENTRA TEACHER - ANNOUNCEMENTS
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        var announcementsList =
            document.getElementById(
                "teacherAnnouncementsList"
            );

        if (!announcementsList) {
            return;
        }


        var announcementForm =
            document.getElementById(
                "announcementForm"
            );

        var openAnnouncementFormBtn =
            document.getElementById(
                "openAnnouncementFormBtn"
            );

        var closeAnnouncementFormBtn =
            document.getElementById(
                "closeAnnouncementFormBtn"
            );

        var cancelAnnouncementBtn =
            document.getElementById(
                "cancelAnnouncementBtn"
            );

        var announcementFormCard =
            document.getElementById(
                "announcementFormCard"
            );

        var announcementSearch =
            document.getElementById(
                "teacherAnnouncementSearch"
            );

        var announcementTypeFilter =
            document.getElementById(
                "teacherAnnouncementTypeFilter"
            );

        var announcementStatusFilter =
            document.getElementById(
                "teacherAnnouncementStatusFilter"
            );

        var announcementCount =
            document.getElementById(
                "teacherAnnouncementsCount"
            );

        var announcementFormMessage =
            document.getElementById(
                "announcementFormMessage"
            );


        var teacherAnnouncements = [];


        // ========================================
        // OPEN FORM
        // ========================================

        if (openAnnouncementFormBtn) {

            openAnnouncementFormBtn.addEventListener(
                "click",
                function () {

                    announcementFormCard.style.display =
                        "block";

                    openAnnouncementFormBtn.style.display =
                        "none";

                    announcementFormCard.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }


        // ========================================
        // CLOSE FORM
        // ========================================

        function closeAnnouncementForm() {

            if (announcementFormCard) {

                announcementFormCard.style.display =
                    "none";

            }

            if (openAnnouncementFormBtn) {

                openAnnouncementFormBtn.style.display =
                    "inline-flex";

            }

            if (announcementFormMessage) {

                announcementFormMessage.textContent =
                    "";

            }

        }


        if (closeAnnouncementFormBtn) {

            closeAnnouncementFormBtn.addEventListener(
                "click",
                closeAnnouncementForm
            );

        }


        if (cancelAnnouncementBtn) {

            cancelAnnouncementBtn.addEventListener(
                "click",
                closeAnnouncementForm
            );

        }


        // ========================================
        // LOAD ANNOUNCEMENTS
        // ========================================

        async function loadTeacherAnnouncements() {

            announcementsList.innerHTML = `
                <div class="teacher-loading-state">
                    Loading announcements...
                </div>
            `;


            try {

                var result =
                    await supabaseClient
                        .from("announcements")
                        .select("*")
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );


                if (result.error) {

                    console.error(
                        "Could not load announcements:",
                        result.error
                    );

                    announcementsList.innerHTML = `
                        <div class="teacher-announcements-empty">
                            <div class="teacher-announcements-empty-icon">
                                ⚠️
                            </div>

                            <h3>
                                Could not load announcements
                            </h3>

                            <p>
                                Please refresh the page and try again.
                            </p>
                        </div>
                    `;

                    return;

                }


                teacherAnnouncements =
                    result.data || [];


                renderTeacherAnnouncements();


            } catch (error) {

                console.error(
                    "Announcement loading error:",
                    error
                );

            }

        }


        // ========================================
        // CREATE ANNOUNCEMENT CARD
        // ========================================

        function createAnnouncementCard(
            announcement
        ) {

            var published =
                announcement.is_published === true;


            var statusText =
                published
                    ? "Published"
                    : "Draft";


            var statusClass =
                published
                    ? "published"
                    : "draft";


            var createdDate =
                announcement.created_at
                    ? new Date(
                        announcement.created_at
                    ).toLocaleDateString(
                        undefined,
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "Unknown date";


            var priority =
                announcement.priority ||
                "normal";


            return `

                <article
                    class="teacher-announcement-card"
                    data-announcement-id="${announcement.id}"
                >

                    <div class="teacher-announcement-card-top">

                        <div>

                            <span class="teacher-announcement-category">
                                ${announcement.type || "General"}
                            </span>

                            <h3>
                                ${announcement.title || "Untitled Announcement"}
                            </h3>

                        </div>


                        <span
                            class="teacher-announcement-status ${statusClass}"
                        >
                            ${statusText}
                        </span>

                    </div>


                    <div class="teacher-announcement-card-message">
                        ${announcement.message || ""}
                    </div>


                    <div class="teacher-announcement-meta">

                        <span>
                            📅 ${createdDate}
                        </span>

                        <span
                            class="teacher-announcement-priority ${priority}"
                        >
                            ⚡ ${priority}
                        </span>

                    </div>


                    <div class="teacher-announcement-actions">

                        <button
                            type="button"
                            class="teacher-announcement-delete-btn"
                            data-announcement-id="${announcement.id}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

            `;

        }


        // ========================================
        // RENDER
        // ========================================

        function renderTeacherAnnouncements() {

            var searchTerm =
                announcementSearch
                    ? announcementSearch.value
                        .trim()
                        .toLowerCase()
                    : "";


            var selectedType =
                announcementTypeFilter
                    ? announcementTypeFilter.value
                    : "all";


            var selectedStatus =
                announcementStatusFilter
                    ? announcementStatusFilter.value
                    : "all";


            var filtered =
                teacherAnnouncements.filter(
                    function (announcement) {

                        var searchableText = `

                            ${announcement.title || ""}

                            ${announcement.message || ""}

                            ${announcement.type || ""}

                        `.toLowerCase();


                        var matchesSearch =
                            !searchTerm ||
                            searchableText.includes(
                                searchTerm
                            );


                        var matchesType =
                            selectedType === "all" ||
                            announcement.type ===
                            selectedType;


                        var announcementStatus =
                            announcement.is_published
                                ? "published"
                                : "draft";


                        var matchesStatus =
                            selectedStatus === "all" ||
                            announcementStatus ===
                            selectedStatus;


                        return (
                            matchesSearch &&
                            matchesType &&
                            matchesStatus
                        );

                    }
                );


            if (announcementCount) {

                announcementCount.textContent =
                    filtered.length +
                    (
                        filtered.length === 1
                            ? " announcement"
                            : " announcements"
                    );

            }


            if (!filtered.length) {

                announcementsList.innerHTML = `

                    <div class="teacher-announcements-empty">

                        <div class="teacher-announcements-empty-icon">
                            📢
                        </div>

                        <h3>
                            No announcements found
                        </h3>

                        <p>
                            Create an announcement to share an update with students.
                        </p>

                    </div>

                `;

                return;

            }


            announcementsList.innerHTML =
                filtered
                    .map(
                        createAnnouncementCard
                    )
                    .join("");


            attachAnnouncementActions();

        }


        // ========================================
        // DELETE
        // ========================================

        function attachAnnouncementActions() {

            document
                .querySelectorAll(
                    ".teacher-announcement-delete-btn"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                deleteAnnouncement(
                                    button.getAttribute(
                                        "data-announcement-id"
                                    )
                                );

                            }
                        );

                    }
                );

        }


        async function deleteAnnouncement(
            announcementId
        ) {

            if (
                !confirm(
                    "Delete this announcement?"
                )
            ) {

                return;

            }


            var result =
                await supabaseClient
                    .from("announcements")
                    .delete()
                    .eq(
                        "id",
                        announcementId
                    );


            if (result.error) {

                console.error(
                    "Could not delete announcement:",
                    result.error
                );

                alert(
                    "Could not delete the announcement."
                );

                return;

            }


            teacherAnnouncements =
                teacherAnnouncements.filter(
                    function (announcement) {

                        return (
                            announcement.id !==
                            announcementId
                        );

                    }
                );


            renderTeacherAnnouncements();

        }


        // ========================================
        // SEARCH
        // ========================================

        if (announcementSearch) {

            announcementSearch.addEventListener(
                "input",
                renderTeacherAnnouncements
            );

        }


        if (announcementTypeFilter) {

            announcementTypeFilter.addEventListener(
                "change",
                renderTeacherAnnouncements
            );

        }


        if (announcementStatusFilter) {

            announcementStatusFilter.addEventListener(
                "change",
                renderTeacherAnnouncements
            );

        }


        // ========================================
        // CREATE
        // ========================================

        if (announcementForm) {

            announcementForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    var title =
                        document.getElementById(
                            "announcementTitle"
                        ).value.trim();


                    var message =
                        document.getElementById(
                            "announcementMessage"
                        ).value.trim();


                    var type =
                        document.getElementById(
                            "announcementType"
                        ).value;


                    var priority =
                        document.getElementById(
                            "announcementPriority"
                        ).value;


                    var expiryInput =
                        document.getElementById(
                            "announcementExpiry"
                        );


                    var isPublished =
                        document.getElementById(
                            "announcementPublished"
                        ).checked;


                    var saveButton =
                        document.getElementById(
                            "saveAnnouncementBtn"
                        );


                    if (
                        !title ||
                        !message ||
                        !type
                    ) {

                        showAnnouncementMessage(
                            "Please complete all required fields.",
                            "error"
                        );

                        return;

                    }


                    try {

                        saveButton.disabled =
                            true;

                        saveButton.textContent =
                            "Publishing...";


                        showAnnouncementMessage(
                            "Publishing announcement...",
                            "loading"
                        );


                        var userResult =
                            await supabaseClient.auth.getUser();


                        var user =
                            userResult.data.user;


                        if (!user) {

                            showAnnouncementMessage(
                                "Please log in again.",
                                "error"
                            );

                            return;

                        }


                        var expiresAt =
                            expiryInput &&
                            expiryInput.value
                                ? new Date(
                                    expiryInput.value
                                ).toISOString()
                                : null;


                        var insertResult =
                            await supabaseClient
                                .from("announcements")
                                .insert({

                                    title:
                                        title,

                                    message:
                                        message,

                                    type:
                                        type,

                                    priority:
                                        priority,

                                    expires_at:
                                        expiresAt,

                                    created_by:
                                        user.id,

                                    is_published:
                                        isPublished,

                                    published_at:
                                        isPublished
                                            ? new Date().toISOString()
                                            : null

                                })
                                .select()
                                .single();


                        if (insertResult.error) {

                            console.error(
                                "Could not create announcement:",
                                insertResult.error
                            );

                            showAnnouncementMessage(
                                "Could not publish the announcement.",
                                "error"
                            );

                            return;

                        }


                        teacherAnnouncements.unshift(
                            insertResult.data
                        );


                        renderTeacherAnnouncements();


                        announcementForm.reset();


                        document.getElementById(
                            "announcementPublished"
                        ).checked = true;


                        showAnnouncementMessage(
                            "Announcement published successfully!",
                            "success"
                        );


                        setTimeout(
                            closeAnnouncementForm,
                            800
                        );


                    } catch (error) {

                        console.error(
                            "Announcement creation error:",
                            error
                        );

                        showAnnouncementMessage(
                            "Something went wrong.",
                            "error"
                        );

                    } finally {

                        saveButton.disabled =
                            false;

                        saveButton.textContent =
                            "Publish Announcement";

                    }

                }
            );

        }


        // ========================================
        // FORM MESSAGE
        // ========================================

        function showAnnouncementMessage(
            message,
            type
        ) {

            if (!announcementFormMessage) {
                return;
            }


            announcementFormMessage.textContent =
                message;


            announcementFormMessage.style.color =
                type === "error"
                    ? "#b42318"
                    : type === "success"
                        ? "#26733c"
                        : "#777";

        }


        // ========================================
        // START
        // ========================================

        loadTeacherAnnouncements();

    }
);
// ========================================
// NAVENTRA TEACHER - NOTIFICATIONS
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        var notificationsList =
            document.getElementById(
                "teacherNotificationsList"
            );

        if (!notificationsList) {
            return;
        }


        var searchInput =
            document.getElementById(
                "teacherNotificationSearch"
            );


        var filterSelect =
            document.getElementById(
                "teacherNotificationFilter"
            );


        var countElement =
            document.getElementById(
                "teacherNotificationCount"
            );


        var markAllButton =
            document.getElementById(
                "markAllNotificationsReadBtn"
            );


        var teacherNotifications = [];


        // ========================================
        // GET CURRENT TEACHER
        // ========================================

        async function getCurrentTeacher() {

            var result =
                await supabaseClient.auth.getUser();


            if (result.error) {

                console.error(
                    "Could not get logged-in user:",
                    result.error
                );

                return null;

            }


            return result.data.user || null;

        }


        // ========================================
        // LOAD NOTIFICATIONS
        // ========================================

        async function loadTeacherNotifications() {

            notificationsList.innerHTML = `
                <div class="teacher-notifications-loading">
                    Loading notifications...
                </div>
            `;


            try {

                var user =
                    await getCurrentTeacher();


                if (!user) {

                    notificationsList.innerHTML = `
                        <div class="teacher-notifications-empty">

                            <div class="teacher-notifications-empty-icon">
                                🔐
                            </div>

                            <h3>
                                Please log in
                            </h3>

                            <p>
                                You must be logged in to view notifications.
                            </p>

                        </div>
                    `;

                    return;

                }


                var result =
                    await supabaseClient
                        .from("notifications")
                        .select("*")
                        .eq("user_id", user.id)
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );


                if (result.error) {

                    console.error(
                        "Could not load notifications:",
                        result.error
                    );


                    notificationsList.innerHTML = `
                        <div class="teacher-notifications-empty">

                            <div class="teacher-notifications-empty-icon">
                                ⚠️
                            </div>

                            <h3>
                                Could not load notifications
                            </h3>

                            <p>
                                Please refresh the page and try again.
                            </p>

                        </div>
                    `;

                    return;

                }


                teacherNotifications =
                    result.data || [];


                renderTeacherNotifications();


            } catch (error) {

                console.error(
                    "Notification loading error:",
                    error
                );


                notificationsList.innerHTML = `
                    <div class="teacher-notifications-empty">

                        <div class="teacher-notifications-empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            Please try again.
                        </p>

                    </div>
                `;

            }

        }


        // ========================================
        // FORMAT DATE
        // ========================================

        function formatNotificationDate(
            dateValue
        ) {

            if (!dateValue) {
                return "Unknown date";
            }


            var date =
                new Date(dateValue);


            return date.toLocaleDateString(
                undefined,
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

        }


        // ========================================
        // NOTIFICATION ICON
        // ========================================

        function getNotificationIcon(
            type
        ) {

            var normalizedType =
                (
                    type || ""
                )
                    .toLowerCase();


            if (
                normalizedType.includes(
                    "announcement"
                )
            ) {
                return "📢";
            }


            if (
                normalizedType.includes(
                    "claim"
                )
            ) {
                return "📋";
            }


            if (
                normalizedType.includes(
                    "resource"
                )
            ) {
                return "📚";
            }


            if (
                normalizedType.includes(
                    "event"
                )
            ) {
                return "📅";
            }


            if (
                normalizedType.includes(
                    "warning"
                )
            ) {
                return "⚠️";
            }


            return "🔔";

        }


        // ========================================
        // CREATE CARD
        // ========================================

        function createNotificationCard(
            notification
        ) {

            var isUnread =
                !notification.is_read;


            var cardClass =
                isUnread
                    ? "unread"
                    : "read";


            var icon =
                getNotificationIcon(
                    notification.type
                );


            var readButton =
                isUnread
                    ? `
                        <button
                            type="button"
                            class="teacher-notification-read-btn"
                            data-notification-id="${notification.id}"
                        >
                            ✓ Mark as Read
                        </button>
                    `
                    : "";


            return `

                <article
                    class="teacher-notification-card ${cardClass}"
                    data-notification-id="${notification.id}"
                >

                    <div class="teacher-notification-icon">
                        ${icon}
                    </div>


                    <div class="teacher-notification-content">

                        <div class="teacher-notification-top">

                            <div>

                                <h3>
                                    ${notification.title || "Notification"}
                                </h3>

                                <p class="teacher-notification-message">
                                    ${
                                        notification.message ||
                                        "No message provided."
                                    }
                                </p>

                            </div>


                            <span class="teacher-notification-date">
                                ${
                                    formatNotificationDate(
                                        notification.created_at
                                    )
                                }
                            </span>

                        </div>


                        <div class="teacher-notification-actions">

                            ${readButton}

                            <button
                                type="button"
                                class="teacher-notification-delete-btn"
                                data-notification-id="${notification.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>


                    ${
                        isUnread
                        ? `
                            <span
                                class="teacher-notification-unread-dot"
                                title="Unread"
                            ></span>
                        `
                        : ""
                    }

                </article>

            `;

        }


        // ========================================
        // RENDER
        // ========================================

        function renderTeacherNotifications() {

            var searchTerm =
                searchInput
                    ? searchInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            var selectedFilter =
                filterSelect
                    ? filterSelect.value
                    : "all";


            var filteredNotifications =
                teacherNotifications.filter(
                    function (notification) {

                        var searchableText = `

                            ${notification.title || ""}

                            ${notification.message || ""}

                            ${notification.type || ""}

                            ${notification.priority || ""}

                        `.toLowerCase();


                        var matchesSearch =
                            !searchTerm ||
                            searchableText.includes(
                                searchTerm
                            );


                        var matchesFilter = true;


                        if (
                            selectedFilter ===
                            "unread"
                        ) {

                            matchesFilter =
                                !notification.is_read;

                        } else if (
                            selectedFilter ===
                            "read"
                        ) {

                            matchesFilter =
                                notification.is_read;

                        }


                        return (
                            matchesSearch &&
                            matchesFilter
                        );

                    }
                );


            var unreadCount =
                teacherNotifications.filter(
                    function (notification) {
                        return !notification.is_read;
                    }
                ).length;


            if (countElement) {

                countElement.textContent =
                    filteredNotifications.length +
                    (
                        filteredNotifications.length === 1
                            ? " notification"
                            : " notifications"
                    ) +
                    (
                        unreadCount > 0
                            ? " • " +
                              unreadCount +
                              " unread"
                            : ""
                    );

            }


            if (
                !filteredNotifications.length
            ) {

                notificationsList.innerHTML = `

                    <div class="teacher-notifications-empty">

                        <div class="teacher-notifications-empty-icon">
                            🔔
                        </div>

                        <h3>
                            No notifications found
                        </h3>

                        <p>
                            You don't have any notifications matching this filter.
                        </p>

                    </div>

                `;

                return;

            }


            notificationsList.innerHTML =
                filteredNotifications
                    .map(
                        createNotificationCard
                    )
                    .join("");


            attachNotificationActions();

        }


        // ========================================
        // MARK AS READ
        // ========================================

        async function markNotificationAsRead(
            notificationId
        ) {

            var result =
                await supabaseClient
                    .from("notifications")
                    .update({
                        is_read: true,
                        read_at: new Date().toISOString()
                    })
                    .eq(
                        "id",
                        notificationId
                    );


            if (result.error) {

                console.error(
                    "Could not mark notification as read:",
                    result.error
                );

                alert(
                    "Could not mark the notification as read."
                );

                return;

            }


            var notification =
                teacherNotifications.find(
                    function (item) {
                        return item.id === notificationId;
                    }
                );


            if (notification) {

                notification.is_read = true;

                notification.read_at =
                    new Date().toISOString();

            }


            renderTeacherNotifications();

        }


        // ========================================
        // DELETE
        // ========================================

        async function deleteTeacherNotification(
            notificationId
        ) {

            var confirmed =
                confirm(
                    "Delete this notification?"
                );


            if (!confirmed) {
                return;
            }


            var result =
                await supabaseClient
                    .from("notifications")
                    .delete()
                    .eq(
                        "id",
                        notificationId
                    );


            if (result.error) {

                console.error(
                    "Could not delete notification:",
                    result.error
                );

                alert(
                    "Could not delete the notification."
                );

                return;

            }


            teacherNotifications =
                teacherNotifications.filter(
                    function (notification) {

                        return (
                            notification.id !==
                            notificationId
                        );

                    }
                );


            renderTeacherNotifications();

        }


        // ========================================
        // MARK ALL AS READ
        // ========================================

        async function markAllNotificationsAsRead() {

            var user =
                await getCurrentTeacher();


            if (!user) {
                return;
            }


            var unreadNotifications =
                teacherNotifications.filter(
                    function (notification) {
                        return !notification.is_read;
                    }
                );


            if (
                !unreadNotifications.length
            ) {

                alert(
                    "All notifications are already read."
                );

                return;

            }


            var result =
                await supabaseClient
                    .from("notifications")
                    .update({
                        is_read: true,
                        read_at: new Date().toISOString()
                    })
                    .eq(
                        "user_id",
                        user.id
                    )
                    .eq(
                        "is_read",
                        false
                    );


            if (result.error) {

                console.error(
                    "Could not mark all notifications as read:",
                    result.error
                );

                alert(
                    "Could not mark all notifications as read."
                );

                return;

            }


            teacherNotifications.forEach(
                function (notification) {

                    notification.is_read =
                        true;

                    notification.read_at =
                        new Date().toISOString();

                }
            );


            renderTeacherNotifications();

        }


        // ========================================
        // BUTTON ACTIONS
        // ========================================

        function attachNotificationActions() {

            var readButtons =
                document.querySelectorAll(
                    ".teacher-notification-read-btn"
                );


            var deleteButtons =
                document.querySelectorAll(
                    ".teacher-notification-delete-btn"
                );


            readButtons.forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            markNotificationAsRead(
                                button.getAttribute(
                                    "data-notification-id"
                                )
                            );

                        }
                    );

                }
            );


            deleteButtons.forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            deleteTeacherNotification(
                                button.getAttribute(
                                    "data-notification-id"
                                )
                            );

                        }
                    );

                }
            );

        }


        // ========================================
        // SEARCH
        // ========================================

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                renderTeacherNotifications
            );

        }


        // ========================================
        // FILTER
        // ========================================

        if (filterSelect) {

            filterSelect.addEventListener(
                "change",
                renderTeacherNotifications
            );

        }


        // ========================================
        // MARK ALL
        // ========================================

        if (markAllButton) {

            markAllButton.addEventListener(
                "click",
                markAllNotificationsAsRead
            );

        }


        // ========================================
        // START
        // ========================================

        loadTeacherNotifications();

    }
);
// ========================================
// NAVENTRA TEACHER - PROFILE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        var profilePage =
            document.getElementById(
                "teacher-profile"
            );

        if (!profilePage) {
            return;
        }


        // ========================================
        // ELEMENTS
        // ========================================

        var editButton =
            document.getElementById(
                "teacherProfileEditBtn"
            );

        var editCard =
            document.getElementById(
                "teacherProfileEditCard"
            );

        var cancelButton =
            document.getElementById(
                "teacherProfileCancelBtn"
            );

        var profileForm =
            document.getElementById(
                "teacherProfileForm"
            );

        var saveButton =
            document.getElementById(
                "teacherProfileSaveBtn"
            );

        var message =
            document.getElementById(
                "teacherProfileFormMessage"
            );


        // ========================================
        // PROFILE ELEMENTS
        // ========================================

        var profileAvatar =
            document.getElementById(
                "teacherProfileAvatar"
            );

        var profileName =
            document.getElementById(
                "teacherProfileName"
            );

        var profileEmail =
            document.getElementById(
                "teacherProfileEmail"
            );

        var profileFullName =
            document.getElementById(
                "teacherProfileFullName"
            );

        var profileEmailValue =
            document.getElementById(
                "teacherProfileEmailValue"
            );

        var profileRole =
            document.getElementById(
                "teacherProfileRoleValue"
            );

        var profileUserId =
            document.getElementById(
                "teacherProfileUserId"
            );

        var profileCreatedAt =
            document.getElementById(
                "teacherProfileCreatedAt"
            );


        // ========================================
        // FORM ELEMENTS
        // ========================================

        var nameInput =
            document.getElementById(
                "teacherProfileNameInput"
            );

        var emailInput =
            document.getElementById(
                "teacherProfileEmailInput"
            );


        // ========================================
        // LOAD PROFILE
        // ========================================

        async function loadTeacherProfile() {

            try {

                var userResult =
                    await supabaseClient.auth.getUser();


                var user =
                    userResult.data.user;


                if (userResult.error || !user) {

                    showProfileMessage(
                        "Please log in again.",
                        "error"
                    );

                    return;
                }


                // ====================================
                // GET PROFILE
                // ====================================

                var profileResult =
                    await supabaseClient
                        .from("profiles")
                        .select("*")
                        .eq(
                            "id",
                            user.id
                        )
                        .single();


                var profile =
                    profileResult.data;


                var profileError =
                    profileResult.error;


                if (
                    profileError &&
                    profileError.code !== "PGRST116"
                ) {

                    console.error(
                        "Could not load teacher profile:",
                        profileError
                    );

                    showProfileMessage(
                        "Could not load your profile.",
                        "error"
                    );

                    return;
                }


                // ====================================
                // PROFILE DATA
                // ====================================

                var fullName =
                    profile &&
                    profile.full_name
                        ? profile.full_name
                        : (
                            user.user_metadata &&
                            user.user_metadata.full_name
                        )
                            ? user.user_metadata.full_name
                            : "Teacher";


                var role =
                    profile &&
                    profile.role
                        ? profile.role
                        : "teacher";


                var email =
                    user.email ||
                    "No email available";


                // ====================================
                // DISPLAY NAME
                // ====================================

                profileName.textContent =
                    fullName;

                profileFullName.textContent =
                    fullName;

                profileEmail.textContent =
                    email;

                profileEmailValue.textContent =
                    email;

                profileRole.textContent =
                    role.charAt(0).toUpperCase() +
                    role.slice(1);


                profileUserId.textContent =
                    user.id;


                // ====================================
                // CREATED DATE
                // ====================================

                if (
                    profile &&
                    profile.created_at
                ) {

                    profileCreatedAt.textContent =
                        new Date(
                            profile.created_at
                        ).toLocaleDateString(
                            undefined,
                            {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            }
                        );

                } else {

                    profileCreatedAt.textContent =
                        "Not available";

                }


                // ====================================
                // AVATAR
                // ====================================

                var firstLetter =
                    fullName
                        .trim()
                        .charAt(0)
                        .toUpperCase();


                profileAvatar.textContent =
                    firstLetter || "T";


                // ====================================
                // FORM
                // ====================================

                nameInput.value =
                    fullName;

                emailInput.value =
                    email;


            } catch (error) {

                console.error(
                    "Teacher profile error:",
                    error
                );

                showProfileMessage(
                    "Something went wrong while loading your profile.",
                    "error"
                );

            }

        }


        // ========================================
        // SHOW MESSAGE
        // ========================================

        function showProfileMessage(
            text,
            type
        ) {

            if (!message) {
                return;
            }


            message.textContent =
                text;


            message.className =
                "teacher-profile-form-message " +
                type;

        }


        // ========================================
        // OPEN EDIT FORM
        // ========================================

        if (editButton) {

            editButton.addEventListener(
                "click",
                function () {

                    editCard.style.display =
                        "block";

                    editCard.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }


        // ========================================
        // CANCEL EDIT
        // ========================================

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                function () {

                    editCard.style.display =
                        "none";

                    if (message) {

                        message.textContent =
                            "";

                        message.className =
                            "teacher-profile-form-message";

                    }

                }
            );

        }


        // ========================================
        // SAVE PROFILE
        // ========================================

        if (profileForm) {

            profileForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    var newName =
                        nameInput.value.trim();


                    if (!newName) {

                        showProfileMessage(
                            "Please enter your full name.",
                            "error"
                        );

                        return;

                    }


                    saveButton.disabled =
                        true;

                    saveButton.textContent =
                        "Saving...";


                    try {

                        // ====================================
                        // GET USER
                        // ====================================

                        var userResult =
                            await supabaseClient
                                .auth
                                .getUser();


                        var user =
                            userResult.data.user;


                        if (
                            userResult.error ||
                            !user
                        ) {

                            showProfileMessage(
                                "Please log in again.",
                                "error"
                            );

                            return;

                        }


                        // ====================================
                        // UPDATE PROFILE
                        // ====================================

                        var updateResult =
                            await supabaseClient
                                .from("profiles")
                                .update({
                                    full_name:
                                        newName
                                })
                                .eq(
                                    "id",
                                    user.id
                                );


                        if (updateResult.error) {

                            console.error(
                                "Could not update teacher profile:",
                                updateResult.error
                            );

                            showProfileMessage(
                                "Could not save your profile.",
                                "error"
                            );

                            return;

                        }


                        // ====================================
                        // UPDATE SCREEN
                        // ====================================

                        profileName.textContent =
                            newName;

                        profileFullName.textContent =
                            newName;


                        profileAvatar.textContent =
                            newName
                                .charAt(0)
                                .toUpperCase();


                        showProfileMessage(
                            "✓ Profile updated successfully.",
                            "success"
                        );


                        setTimeout(
                            function () {

                                editCard.style.display =
                                    "none";

                                message.textContent =
                                    "";

                                message.className =
                                    "teacher-profile-form-message";

                            },
                            1200
                        );


                    } catch (error) {

                        console.error(
                            "Profile update error:",
                            error
                        );

                        showProfileMessage(
                            "Something went wrong. Please try again.",
                            "error"
                        );

                    } finally {

                        saveButton.disabled =
                            false;

                        saveButton.textContent =
                            "💾 Save Changes";

                    }

                }
            );

        }


        // ========================================
        // START
        // ========================================

        loadTeacherProfile();

    }
);