const SUPABASE_URL = "https://bepjrkmjvocotcxfgmlj.supabase.co/";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zYMFeoiJsB5ukZycl2H6sg_4a85UDW2";
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
function goToLogin() {
    window.location.href = "login.html";
}

function scrollToFeatures() {
    document.getElementById("features").scrollIntoView({
        behavior: "smooth"
    });
}

// ========================================
// NAVENTRA LOGIN
// ========================================

var selectedLoginRole = "student";


// ========================================
// PORTAL ROLE SELECTION
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    var roleButtons =
        document.querySelectorAll(
            ".login-role-btn"
        );


    if (!roleButtons.length) {
        return;
    }


    roleButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                roleButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add("active");


                selectedLoginRole =
                    button.getAttribute(
                        "data-role"
                    );


                var heading =
                    document.getElementById(
                        "loginHeading"
                    );

                var description =
                    document.getElementById(
                        "loginDescription"
                    );


                if (heading) {

                    if (
                        selectedLoginRole ===
                        "student"
                    ) {

                        heading.textContent =
                            "Student Sign In";

                    } else if (
                        selectedLoginRole ===
                        "teacher"
                    ) {

                        heading.textContent =
                            "Teacher Sign In";

                    } else if (
                        selectedLoginRole ===
                        "admin"
                    ) {

                        heading.textContent =
                            "Admin Sign In";

                    }

                }


                if (description) {

                    description.textContent =
                        "Enter your school account details to continue.";

                }

            }
        );

    });

});


// ========================================
// LOGIN USER
// ========================================

async function loginUser(
    email,
    password
) {

    try {

        var result =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        var data = result.data;
        var error = result.error;


        if (error) {

            alert(error.message);

            return;

        }


        var user =
            data.user;


        if (!user) {

            alert(
                "Could not find your account."
            );

            return;

        }


        // ====================================
        // GET USER PROFILE
        // ====================================

        var profileResult =
            await supabaseClient
                .from("profiles")
                .select("full_name, role")
                .eq("id", user.id)
                .single();


        var profile =
            profileResult.data;

        var profileError =
            profileResult.error;


        if (profileError || !profile) {

            console.error(
                "Profile lookup error:",
                profileError
            );


            await supabaseClient.auth.signOut();


            alert(
                "Your Naventra profile could not be found."
            );

            return;

        }


        // ====================================
        // CHECK SELECTED ROLE
        // ====================================

        var actualRole =
            (profile.role || "")
                .toLowerCase()
                .trim();


        if (
            actualRole !==
            selectedLoginRole
        ) {

            await supabaseClient.auth.signOut();


            var roleName =
                actualRole
                    ? actualRole.charAt(0).toUpperCase() +
                      actualRole.slice(1)
                    : "another portal";


            alert(
                "Access denied.\n\n" +
                "This account is registered as " +
                roleName +
                ".\n\n" +
                "Please select the correct portal."
            );

            return;

        }


        // ====================================
        // ROLE-BASED REDIRECT
        // ====================================

        if (
            actualRole ===
            "student"
        ) {

            window.location.href =
                "dashboard.html";


        } else if (
            actualRole ===
            "teacher"
        ) {

            window.location.href =
                "teacher-dashboard.html";


        } else if (
            actualRole ===
            "admin"
        ) {

            window.location.href =
                "admin-dashboard.html";


        } else {

            await supabaseClient.auth.signOut();


            alert(
                "Your account has an invalid Naventra role."
            );

        }

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        alert(
            "Something went wrong while signing in."
        );

    }

}


// ========================================
// HANDLE LOGIN FORM
// ========================================

function handleLogin(event) {

    event.preventDefault();


    var email =
        document.getElementById(
            "email"
        ).value.trim();


    var password =
        document.getElementById(
            "password"
        ).value;


    if (!email || !password) {

        alert(
            "Please enter your school email and password."
        );

        return;

    }


    loginUser(
        email,
        password
    );

}

async function loadDashboard() {
    if (document.body.classList.contains("teacher-portal-page")) {
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    document.getElementById("studentName").textContent =
        `Welcome, ${profile.full_name}!`;
}

if (window.location.pathname.endsWith("dashboard.html")) {
    loadDashboard();
}
// ========================================
// NAVENTRA STUDENT PORTAL CONTROLS
// ========================================

// Sidebar menu
const menuBtn = document.getElementById("menuBtn");
const portalSidebar = document.getElementById("portalSidebar");

if (menuBtn && portalSidebar) {
    menuBtn.addEventListener("click", () => {
        portalSidebar.classList.toggle("open");
    });
}


// Close sidebar when a navigation item is clicked
document.querySelectorAll(".sidebar-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".sidebar-link").forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

        if (portalSidebar) {
            portalSidebar.classList.remove("open");
        }
    });
});


// Dark mode
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        const darkModeEnabled =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            "naventraDarkMode",
            darkModeEnabled ? "true" : "false"
        );

        themeToggle.textContent =
            darkModeEnabled ? "☀️" : "🌙";
    });
}


// Load saved dark mode preference
if (localStorage.getItem("naventraDarkMode") === "true") {
    document.body.classList.add("dark-mode");

    if (themeToggle) {
        themeToggle.textContent = "☀️";
    }
}


// Logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error("Logout error:", error);
            alert("Unable to log out. Please try again.");
            return;
        }

        window.location.href = "login.html";
    });
}


// Load student information into the portal
async function loadStudentPortal() {

    if (!window.location.pathname.endsWith("dashboard.html")) {
        return;
    }

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.href = "login.html";
        return;
    }


    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single();

    if (profileError) {
        console.error("Profile error:", profileError);
        return;
    }


    // Make sure only students can access the Student Portal
if (
    document.body.classList.contains("student-portal-page") &&
    profile.role !== "student"
) {
    alert("This portal is only available to student accounts.");
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
    return;
}


    // Display student name
    const studentName =
        document.getElementById("studentName");

    if (studentName) {
        studentName.textContent =
            profile.full_name || "Student";
    }


    // Display name in sidebar
    const sidebarStudentName =
        document.getElementById("sidebarStudentName");

    if (sidebarStudentName) {
        sidebarStudentName.textContent =
            profile.full_name || "Student";
    }
// Set profile initials
const nameParts = (profile.full_name || "Student")
    .trim()
    .split(/\s+/);

let initials = nameParts[0]?.charAt(0) || "S";

if (nameParts.length > 1) {
    initials += nameParts[nameParts.length - 1].charAt(0);
}

initials = initials.toUpperCase();


// Top-right profile
const topProfileInitials =
    document.getElementById("topProfileInitials");

if (topProfileInitials) {
    topProfileInitials.textContent = initials;
}


// Sidebar profile
const sidebarProfileInitials =
    document.getElementById("sidebarProfileInitials");

if (sidebarProfileInitials) {
    sidebarProfileInitials.textContent = initials;

}

  
    // ========================================
    // LOAD ACTIVE CLAIMS COUNT
    // ========================================

    const { count: activeClaimsCount, error: claimsCountError } =
        await supabaseClient
            .from("lost_found_claims")
            .select("*", { count: "exact", head: true })
            .eq("student_id", user.id)
            .eq("status", "pending");

    if (claimsCountError) {
        console.error(
            "Active claims count error:",
            claimsCountError
        );
    } else {
        const activeClaimsElement =
            document.getElementById("activeClaimsCount");

        if (activeClaimsElement) {
            activeClaimsElement.textContent =
                activeClaimsCount || 0;
        }
    }
}


// Start Student Portal
loadStudentPortal();


// ========================================
// NAVENTRA PORTAL PAGE NAVIGATION
// ========================================

const sidebarLinks = document.querySelectorAll(".sidebar-link");

const portalPages = {
    "dashboard": "dashboardPage",
    "lost-found": "lostFoundPage",
    "assessment": "assessmentPage",
    "explorer": "explorerPage",
    "saved-careers": "savedCareersPage",
    "events": "eventsPage",
    "announcements": "announcementsPage",
    "resources": "resourcesPage",
    "notifications": "notificationsPage",
    "achievements": "achievementsPage",
    "help": "helpPage",
    "profile": "profilePage"
};

sidebarLinks.forEach(link => {

    link.addEventListener("click", () => {

        const pageName = link.dataset.page;
        const pageId = portalPages[pageName];

        if (!pageId) return;

        // Hide all portal pages
        document.querySelectorAll(".portal-section").forEach(page => {
            page.classList.remove("active");
        });

        // Show selected page
const selectedPage = document.getElementById(pageId);

if (selectedPage) {
    selectedPage.classList.add("active");

   if (pageName === "explorer") {
    loadCareerExplorer();
}

if (pageName === "saved-careers") {
    loadSavedCareers();
}
            if (pageName === "resources") {
                loadStudentResources();
            }
}

        // Update active menu item
        sidebarLinks.forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");

        // Close sidebar after selecting a page
        const sidebar = document.getElementById("portalSidebar");

        if (sidebar) {
            sidebar.classList.remove("open");
        }
    });

});


// ========================================
// LOAD LOST & FOUND ITEMS
// ========================================

let lostFoundItemsData = [];

async function loadLostFoundItems() {

    const container =
        document.getElementById("lostFoundItems");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-state">
            Loading verified items...
        </div>
    `;

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        container.innerHTML = `
            <div class="empty-state">
                Please log in again to view Lost & Found.
            </div>
        `;
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("lost_items")
            .select("*")
            .order("created_at", { ascending: false });

    if (error) {

        console.error(
            "❌ Lost & Found items error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load Lost & Found items.
            </div>
        `;

        return;
    }

    lostFoundItemsData = data || [];

    console.log(
        "✅ Lost & Found items loaded:",
        lostFoundItemsData.length
    );

    renderLostFoundItems();
}


// ========================================
// RENDER LOST & FOUND ITEMS
// ========================================

function renderLostFoundItems() {

    const container =
        document.getElementById("lostFoundItems");

    if (!container) {
        return;
    }

    const searchInput =
        document.getElementById("lostFoundSearch");

    const categorySelect =
        document.getElementById("lostFoundCategory");

    const locationSelect =
        document.getElementById("lostFoundLocation");

    const statusSelect =
        document.getElementById("lostFoundStatus");


    const searchText =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const category =
        categorySelect
            ? categorySelect.value.toLowerCase()
            : "";

    const location =
        locationSelect
            ? locationSelect.value.toLowerCase()
            : "";

    const status =
        statusSelect
            ? statusSelect.value.toLowerCase()
            : "";


    const filtered =
        lostFoundItemsData.filter(item => {

            const itemName =
                String(
                    item.item_name || ""
                ).toLowerCase();

            const itemCategory =
                String(
                    item.category || ""
                ).toLowerCase();

            const itemLocation =
                String(
                    item.location || ""
                ).toLowerCase();

            const itemStatus =
                String(
                    item.status || ""
                ).toLowerCase();


            return (

                (!searchText ||
                    itemName.includes(searchText))

                &&

                (!category ||
                    itemCategory === category)

                &&

                (!location ||
                    itemLocation === location)

                &&

                (!status ||
                    itemStatus === status)

            );

        });


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                No Lost & Found items match your search.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered.map(item => {

            const itemName =
                item.item_name ||
                "Unnamed Item";

            const description =
                item.description ||
                "No description available.";

            const itemLocation =
                item.location ||
                "Unknown location";

            const itemStatus =
                item.status ||
                "found";

            const image =
                item.image_url;


            const date =
                item.created_at
                    ? new Date(
                        item.created_at
                    ).toLocaleDateString(
                        undefined,
                        {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    )
                    : "—";


            return `
                <article
                    class="lost-item-card"
                    data-item-id="${item.id}"
                >

                    <div class="lost-item-image">

                        ${
                            image
                                ? `
                                    <img
                                        src="${image}"
                                        alt="${itemName}"
                                    >
                                  `
                                : `
                                    🔍
                                  `
                        }

                    </div>


                    <div class="lost-item-content">

                        <h3>
                            ${itemName}
                        </h3>

                        <p class="lost-item-description">
                            ${description}
                        </p>


                        <div class="lost-item-meta">

                            <span>
                                📍 ${itemLocation}
                            </span>

                            <span>
                                📅 Found: ${date}
                            </span>

                            <span class="item-status">
                                ✓ ${
                                    itemStatus
                                        .charAt(0)
                                        .toUpperCase() +
                                    itemStatus.slice(1)
                                }
                            </span>

                        </div>


                        <button
                            type="button"
                            class="claim-item-btn"
                            data-item-id="${item.id}"
                        >
                            This is Mine
                        </button>

                    </div>

                </article>
            `;

        }).join("");


    // Add claim button listeners

    container
        .querySelectorAll(".claim-item-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const itemId =
                        button.dataset.itemId;

                    openLostFoundClaim(
                        itemId
                    );

                }
            );

        });

}


// ========================================
// OPEN CLAIM FOR SELECTED ITEM
// ========================================

function openLostFoundClaim(itemId) {

    const item =
        lostFoundItemsData.find(
            item =>
                String(item.id) ===
                String(itemId)
        );

    if (!item) {
        console.error(
            "❌ Lost & Found item not found:",
            itemId
        );
        return;
    }

    window.selectedLostFoundItem =
        item;


    const claimModal =
        document.getElementById(
            "claimModal"
        );

    if (!claimModal) {
        return;
    }


    // Put selected item name into modal

    const itemNameInput =
        document.getElementById(
            "claimItemName"
        );

    if (itemNameInput) {

        itemNameInput.value =
            item.item_name || "";

    }


    claimModal.classList.add(
        "active"
    );

}


// ========================================
// LOST & FOUND FILTERS
// ========================================

[
    "lostFoundSearch",
    "lostFoundCategory",
    "lostFoundLocation",
    "lostFoundStatus"
].forEach(id => {

    const element =
        document.getElementById(id);

    if (element) {

        element.addEventListener(
            "input",
            renderLostFoundItems
        );

        element.addEventListener(
            "change",
            renderLostFoundItems
        );

    }

});


// ========================================
// INITIAL LOAD
// ========================================

loadLostFoundItems();

// ========================================
// LOST & FOUND CLAIM MODAL
// ========================================

const claimItemBtn = document.getElementById("claimItemBtn");
const claimModal = document.getElementById("claimModal");
const claimModalClose = document.getElementById("claimModalClose");

if (claimItemBtn && claimModal) {

    claimItemBtn.addEventListener("click", async () => {

        // Get the logged-in student
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            alert("Please log in again.");
            return;
        }

        // Check whether this student already has a claim
        const { data: existingClaim, error: claimError } =
            await supabaseClient
                .from("lost_found_claims")
                .select("*")
                .eq("student_id", user.id)
                .eq("item_name", "Black Water Bottle")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

        if (claimError) {
            console.error("Claim lookup error:", claimError);
            alert("Unable to check your claim status. Please try again.");
            return;
        }

        // If a claim already exists, show its status
        if (existingClaim) {

            const claimModalContent =
                document.querySelector(".claim-modal-content");

            claimModalContent.innerHTML = `
                <button
                    class="claim-modal-close"
                    id="existingClaimClose"
                    aria-label="Close"
                >
                    ×
                </button>

                <div class="claim-success">

                    <div class="claim-success-icon">
                        ✓
                    </div>

                    <span class="section-label">
                        CLAIM ALREADY SUBMITTED
                    </span>

                    <h2>Claim Status: ${
                        existingClaim.status === "pending"
                            ? "Pending Verification"
                            : existingClaim.status
                    }</h2>

                    <p>
                        You have already submitted a claim for this item.
                        You do not need to submit the form again.
                    </p>

                    <div class="claim-process">

                        <div class="claim-step completed">
                            <div class="claim-step-icon">✓</div>
                            <span>Claim submitted</span>
                        </div>

                        <div class="claim-step current">
                            <div class="claim-step-icon">2</div>
                            <span>Teacher review</span>
                        </div>

                        <div class="claim-step">
                            <div class="claim-step-icon">3</div>
                            <span>Approval or rejection</span>
                        </div>

                        <div class="claim-step">
                            <div class="claim-step-icon">4</div>
                            <span>Student notification</span>
                        </div>

                    </div>

                    <button
                        class="primary-btn"
                        id="existingClaimDoneBtn"
                    >
                        Done
                    </button>

                </div>
            `;

            const existingClaimClose =
                document.getElementById("existingClaimClose");

            const existingClaimDoneBtn =
                document.getElementById("existingClaimDoneBtn");

            if (existingClaimClose) {
                existingClaimClose.addEventListener("click", () => {
                    claimModal.classList.remove("active");
                });
            }

            if (existingClaimDoneBtn) {
                existingClaimDoneBtn.addEventListener("click", () => {
                    claimModal.classList.remove("active");
                });
            }

            claimModal.classList.add("active");

            return;
        }

        // No previous claim → show the normal claim form
        claimModal.classList.add("active");
    });
}

if (claimModalClose && claimModal) {
    claimModalClose.addEventListener("click", () => {
        claimModal.classList.remove("active");
    });
}

// Close when clicking outside the modal
if (claimModal) {
    claimModal.addEventListener("click", (event) => {
        if (event.target === claimModal) {
            claimModal.classList.remove("active");
        }
    });
}
// ========================================
// LOST & FOUND CLAIM FORM
// ========================================

// ========================================
// LOST & FOUND CLAIM FORM
// ========================================

const claimForm = document.getElementById("claimForm");

if (claimForm) {

    claimForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const fullName =
            document.getElementById("claimFullName").value.trim();

        const studentClass =
            document.getElementById("claimClass").value.trim();

        const contactInfo =
            document.getElementById("claimContact").value.trim();

        const reason =
            document.getElementById("claimReason").value.trim();

        // Get currently logged-in student
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            alert("Your session has expired. Please log in again.");
            window.location.href = "login.html";
            return;
        }

        // Save claim to Supabase
        const { error } = await supabaseClient
            .from("lost_found_claims")
            .insert({
                student_id: user.id,
                item_name: window.selectedLostFoundItem?.item_name || "Unknown Item",
                full_name: fullName,
                class: studentClass,
                contact_info: contactInfo,
                reason: reason,
                status: "pending"
            });

        

        // Show successful submission
        const claimModalContent =
            document.querySelector(".claim-modal-content");

        claimModalContent.innerHTML = `
            <button
                class="claim-modal-close"
                id="claimSuccessClose"
                aria-label="Close"
            >
                ×
            </button>

            <div class="claim-success">

                <div class="claim-success-icon">
                    ✓
                </div>

                <span class="section-label">
                    CLAIM SUBMITTED
                </span>

                <h2>Claim Status: Pending Verification</h2>

                <p>
                    Your claim has been submitted successfully.
                    A school staff member will review the information
                    and notify you once a decision has been made.
                </p>

                <div class="claim-process">

                    <div class="claim-step completed">
                        <div class="claim-step-icon">✓</div>
                        <span>Claim submitted</span>
                    </div>

                    <div class="claim-step current">
                        <div class="claim-step-icon">2</div>
                        <span>Teacher review</span>
                    </div>

                    <div class="claim-step">
                        <div class="claim-step-icon">3</div>
                        <span>Approval or rejection</span>
                    </div>

                    <div class="claim-step">
                        <div class="claim-step-icon">4</div>
                        <span>Student notification</span>
                    </div>

                </div>

                <button
                    class="primary-btn"
                    id="claimDoneBtn"
                >
                    Done
                </button>

            </div>
        `;

        const successClose =
            document.getElementById("claimSuccessClose");

        const claimDoneBtn =
            document.getElementById("claimDoneBtn");

        if (successClose) {
            successClose.addEventListener("click", () => {
                claimModal.classList.remove("active");
            });
        }

        if (claimDoneBtn) {
            claimDoneBtn.addEventListener("click", () => {
                claimModal.classList.remove("active");
            });
        }

    });

}
// ========================================
// ACTIVE CLAIMS CARD
// ========================================

const activeClaimsCard =
    document.getElementById("activeClaimsCard");

if (activeClaimsCard) {

    activeClaimsCard.addEventListener("click", () => {

        const lostFoundLink =
            document.querySelector(
                '.sidebar-link[data-page="lost-found"]'
            );

        if (lostFoundLink) {
            lostFoundLink.click();
        }

    });

}
// ========================================
// LOAD MY LOST & FOUND CLAIMS
// ========================================

async function loadMyClaims() {

    const myClaimsList =
        document.getElementById("myClaimsList");

    if (!myClaimsList) {
        return;
    }

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        myClaimsList.innerHTML = `
            <div class="empty-state">
                Please log in to view your claims.
            </div>
        `;
        return;
    }

    const { data: claims, error: claimsError } =
        await supabaseClient
            .from("lost_found_claims")
            .select("*")
            .eq("student_id", user.id)
            .order("created_at", { ascending: false });

    if (claimsError) {
        console.error("My claims error:", claimsError);

        myClaimsList.innerHTML = `
            <div class="empty-state">
                Unable to load your claims.
            </div>
        `;

        return;
    }

    if (!claims || claims.length === 0) {
        myClaimsList.innerHTML = `
            <div class="empty-state">
                You haven't submitted any claims yet.
            </div>
        `;

        return;
    }

    myClaimsList.innerHTML = claims.map(claim => {

        const status =
            (claim.status || "pending").toLowerCase();

        const statusText =
            status === "pending"
                ? "Pending Verification"
                : status.charAt(0).toUpperCase() +
                  status.slice(1);

        return `
            <article class="my-claim-card">

                <div class="my-claim-icon">
                    👜
                </div>

                <div class="my-claim-content">

                    <span class="section-label">
                        CLAIM
                    </span>

                    <h3>
                        ${claim.item_name || "Lost Item"}
                    </h3>

                    <p>
                        Submitted by ${claim.full_name || "Student"}
                    </p>

                    <div class="my-claim-status">
                        ${statusText}
                    </div>

                    <div class="claim-process">

                        <div class="claim-step completed">
                            <div class="claim-step-icon">✓</div>
                            <span>Claim submitted</span>
                        </div>

                        <div class="claim-step ${
                            status === "pending"
                                ? "current"
                                : "completed"
                        }">
                            <div class="claim-step-icon">
                                ${
                                    status === "pending"
                                        ? "2"
                                        : "✓"
                                }
                            </div>
                            <span>Teacher review</span>
                        </div>

                        <div class="claim-step">
                            <div class="claim-step-icon">3</div>
                            <span>Approval or rejection</span>
                        </div>

                        <div class="claim-step">
                            <div class="claim-step-icon">4</div>
                            <span>Student notification</span>
                        </div>

                    </div>

                </div>

            </article>
        `;

    }).join("");
}


// Load claims when the page is available
loadMyClaims();
// ========================================
// CAREER ASSESSMENT
// ========================================

const assessmentIntro =
    document.getElementById("assessmentIntro");

const assessmentQuestions =
    document.getElementById("assessmentQuestions");

const assessmentResults =
    document.getElementById("assessmentResults");

const startAssessmentBtn =
    document.getElementById("startAssessmentBtn");

const viewPastAssessmentBtn =
    document.getElementById("viewPastAssessmentBtn");

    // ========================================
// CHECK FOR PREVIOUS ASSESSMENT
// ========================================

async function checkPreviousAssessment() {

    if (!viewPastAssessmentBtn) return;

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("career_assessments")
        .select("id")
        .eq("student_id", user.id)
        .eq("status", "completed")
        .limit(1);

    if (error) {
        console.error(
            "Could not check previous assessment:",
            error
        );
        return;
    }

    if (data && data.length > 0) {
        viewPastAssessmentBtn.style.display = "inline-flex";
    } else {
        viewPastAssessmentBtn.style.display = "none";
    }
}

// ========================================
// VIEW PAST ASSESSMENT BUTTON
// ========================================

if (viewPastAssessmentBtn) {

    viewPastAssessmentBtn.addEventListener(
        "click",
        async () => {

            await loadLatestAssessmentResult();

        }
    );

}
checkPreviousAssessment();

const assessmentQuestion =
    document.getElementById("assessmentQuestion");

const assessmentOptions =
    document.getElementById("assessmentOptions");

const assessmentNextBtn =
    document.getElementById("assessmentNextBtn");

const assessmentBackBtn =
    document.getElementById("assessmentBackBtn");

const assessmentQuestionNumber =
    document.getElementById("assessmentQuestionNumber");

const assessmentProgressPercent =
    document.getElementById("assessmentProgressPercent");

const assessmentProgressFill =
    document.getElementById("assessmentProgressFill");

const retakeAssessmentBtn =
    document.getElementById("retakeAssessmentBtn");
    const careerResultsList =
    document.getElementById("careerResultsList");


// Assessment questions

const careerAssessmentQuestions = [


    {
        question: "Which school subjects do you enjoy the most?",
        type: "multiple",
        category: "subjects",
        options: [
            { text: "Mathematics", scores: { technology: 2, engineering: 2, science: 2, business: 1 } },
            { text: "Physics", scores: { engineering: 3, science: 3, technology: 1 } },
            { text: "Chemistry", scores: { science: 3, healthcare: 2, engineering: 1 } },
            { text: "Biology", scores: { healthcare: 3, science: 3, psychology: 1 } },
            { text: "Computer Science", scores: { technology: 3, engineering: 1 } },
            { text: "Artificial Intelligence", scores: { technology: 3, science: 2 } },
            { text: "English", scores: { media: 2, education: 2, creative: 1 } },
            { text: "Literature", scores: { creative: 2, media: 2, education: 2 } },
            { text: "History", scores: { education: 2, media: 1, business: 1 } },
            { text: "Geography", scores: { science: 2, environment: 3 } },
            { text: "Economics", scores: { business: 3, technology: 1 } },
            { text: "Business Studies", scores: { business: 3, management: 3, leadership: 2 } },
            { text: "Psychology", scores: { psychology: 3, healthcare: 1, education: 2 } },
            { text: "Art & Design", scores: { design: 3, creative: 3 } },
            { text: "Music", scores: { creative: 3, media: 2 } },
            { text: "Media Studies", scores: { media: 3, creative: 2 } },
            { text: "Physical Education", scores: { healthcare: 2, leadership: 2 } },
            { text: "Languages", scores: { education: 2, media: 2, business: 1 } }
        ]
    },

    {
        question: "When you have free time, what would you most likely choose to do?",
        type: "single",
        category: "interests",
        options: [
            { text: "Build, code or experiment with something", scores: { technology: 3, engineering: 2 } },
            { text: "Read, research or learn something new", scores: { science: 2, education: 2 } },
            { text: "Draw, design, edit or create something", scores: { design: 3, creative: 3, media: 2 } },
            { text: "Talk with friends or help someone", scores: { psychology: 3, education: 2, healthcare: 2 } },
            { text: "Organize an event or activity", scores: { management: 3, business: 2, leadership: 2 } },
            { text: "Write stories, scripts or posts", scores: { media: 3, creative: 3 } }
        ]
    },

    {
        question: "You are given a difficult problem. What is your first instinct?",
        type: "single",
        category: "problemSolving",
        options: [
            { text: "Break it into smaller logical steps", scores: { technology: 2, engineering: 3, science: 2 } },
            { text: "Research and understand the facts first", scores: { science: 3, technology: 2 } },
            { text: "Think of an unusual or creative solution", scores: { creative: 3, design: 3 } },
            { text: "Ask people for their ideas and perspectives", scores: { psychology: 2, education: 2, business: 1 } },
            { text: "Take charge and create a plan", scores: { leadership: 3, management: 3 } }
        ]
    },

    {
        question: "Which kind of work would make you feel most satisfied?",
        type: "single",
        category: "values",
        options: [
            { text: "Inventing or building something useful", scores: { engineering: 3, technology: 3 } },
            { text: "Discovering something new", scores: { science: 3, healthcare: 1 } },
            { text: "Helping someone overcome a challenge", scores: { healthcare: 3, psychology: 3, education: 2 } },
            { text: "Creating something people enjoy", scores: { creative: 3, media: 3, design: 2 } },
            { text: "Leading a successful project", scores: { business: 3, management: 3, leadership: 3 } }
        ]
    },

    {
        question: "Which description sounds most like you?",
        type: "single",
        category: "personality",
        options: [
            { text: "Curious — I always want to know how things work", scores: { science: 3, technology: 2 } },
            { text: "Creative — I constantly come up with ideas", scores: { creative: 3, design: 3 } },
            { text: "Caring — I notice when people need help", scores: { healthcare: 2, psychology: 3, education: 2 } },
            { text: "Organized — I like planning and keeping things on track", scores: { management: 3, business: 2 } },
            { text: "Confident — I enjoy taking responsibility", scores: { leadership: 3, business: 2 } },
            { text: "Analytical — I like finding patterns and evidence", scores: { technology: 2, science: 3, engineering: 2 } }
        ]
    },

    {
        question: "How do you prefer to learn something completely new?",
        type: "single",
        category: "learning",
        options: [
            { text: "Experiment and learn by doing", scores: { engineering: 2, technology: 2, science: 2 } },
            { text: "Read detailed explanations", scores: { science: 2, education: 2 } },
            { text: "Watch demonstrations or visual examples", scores: { design: 2, media: 2, creative: 1 } },
            { text: "Discuss it with someone", scores: { psychology: 2, education: 2 } },
            { text: "Try to teach it to someone else", scores: { education: 3, leadership: 1 } }
        ]
    },

    {
        question: "Which working environment sounds most appealing?",
        type: "single",
        category: "environment",
        options: [
            { text: "Technology company or digital workspace", scores: { technology: 3, business: 1 } },
            { text: "Laboratory or research centre", scores: { science: 3, healthcare: 2 } },
            { text: "Hospital or healthcare environment", scores: { healthcare: 3 } },
            { text: "Studio, creative agency or production set", scores: { creative: 3, media: 3, design: 2 } },
            { text: "School, university or learning environment", scores: { education: 3, psychology: 2 } },
            { text: "Company, organization or business environment", scores: { business: 3, management: 3 } }
        ]
    },

    {
        question: "What role do you naturally take when working in a group?",
        type: "single",
        category: "teamwork",
        options: [
            { text: "I lead and coordinate everyone", scores: { leadership: 3, management: 3 } },
            { text: "I come up with ideas", scores: { creative: 3, design: 2 } },
            { text: "I solve the difficult technical parts", scores: { technology: 3, engineering: 3 } },
            { text: "I make sure everyone gets along", scores: { psychology: 3, education: 2 } },
            { text: "I research information for the group", scores: { science: 3, technology: 1 } },
            { text: "I communicate and present our work", scores: { media: 3, education: 2, business: 2 } }
        ]
    },

    {
        question: "Which skill would you most enjoy developing?",
        type: "single",
        category: "skills",
        options: [
            { text: "Programming and software development", scores: { technology: 3 } },
            { text: "Scientific research and experimentation", scores: { science: 3 } },
            { text: "Design and visual communication", scores: { design: 3, creative: 2 } },
            { text: "Writing, storytelling and filmmaking", scores: { media: 3, creative: 3 } },
            { text: "Communication and teaching", scores: { education: 3, psychology: 2 } },
            { text: "Leadership and business strategy", scores: { business: 3, leadership: 3 } }
        ]
    },

    {
        question: "What kind of challenges excite you most?",
        type: "single",
        category: "challenges",
        options: [
            { text: "Technical puzzles", scores: { technology: 3, engineering: 3 } },
            { text: "Scientific mysteries", scores: { science: 3 } },
            { text: "Designing something from scratch", scores: { design: 3, creative: 3 } },
            { text: "Understanding people and their behaviour", scores: { psychology: 3 } },
            { text: "Organizing complex projects", scores: { management: 3, business: 2 } },
            { text: "Communicating an important idea", scores: { media: 3, education: 2 } }
        ]
    },

    {
        question: "How important is creativity in your future career?",
        type: "single",
        category: "creativity",
        options: [
            { text: "Extremely important — I want to create every day", scores: { creative: 3, design: 3, media: 2 } },
            { text: "Very important — I want some creative freedom", scores: { design: 2, technology: 1, media: 2 } },
            { text: "Somewhat important", scores: { business: 1, education: 1 } },
            { text: "Not a major factor — I prefer logic and structure", scores: { science: 2, engineering: 2, technology: 2 } }
        ]
    },

    {
        question: "What kind of impact would you like your career to have?",
        type: "single",
        category: "impact",
        options: [
            { text: "Improve people's health", scores: { healthcare: 3, science: 1 } },
            { text: "Help people learn and grow", scores: { education: 3, psychology: 2 } },
            { text: "Develop new technology", scores: { technology: 3, engineering: 2 } },
            { text: "Protect the environment", scores: { science: 3, engineering: 1 } },
            { text: "Inspire people through creativity", scores: { creative: 3, media: 3 } },
            { text: "Build successful organizations", scores: { business: 3, management: 3 } }
        ]
    },

    {
        question: "How do you usually make important decisions?",
        type: "single",
        category: "decisionMaking",
        options: [
            { text: "I compare facts and evidence", scores: { science: 3, technology: 2 } },
            { text: "I think about how people will be affected", scores: { psychology: 3, healthcare: 2 } },
            { text: "I trust my creativity and intuition", scores: { creative: 3, design: 2 } },
            { text: "I consider practical outcomes and risks", scores: { business: 3, management: 2 } },
            { text: "I take advice and discuss it with others", scores: { education: 2, psychology: 2 } }
        ]
    },

    {
        question: "Which type of project would you choose?",
        type: "single",
        category: "projects",
        options: [
            { text: "Build an app or website", scores: { technology: 3, design: 1 } },
            { text: "Conduct a science experiment", scores: { science: 3 } },
            { text: "Design a product or visual campaign", scores: { design: 3, creative: 2 } },
            { text: "Create a short film or documentary", scores: { media: 3, creative: 3 } },
            { text: "Organize a school event", scores: { management: 3, leadership: 2 } },
            { text: "Create a project that helps students", scores: { education: 3, psychology: 2 } }
        ]
    },

    {
        question: "What motivates you most?",
        type: "single",
        category: "motivation",
        options: [
            { text: "Solving difficult problems", scores: { technology: 2, engineering: 3, science: 2 } },
            { text: "Helping other people", scores: { healthcare: 3, psychology: 3, education: 2 } },
            { text: "Freedom to create", scores: { creative: 3, design: 3 } },
            { text: "Learning and discovering new things", scores: { science: 3, technology: 2 } },
            { text: "Achieving ambitious goals", scores: { business: 3, leadership: 3 } },
            { text: "Being recognized for good work", scores: { media: 2, business: 2, leadership: 2 } }
        ]
    },

    {
        question: "Which statement best describes your ideal future?",
        type: "single",
        category: "future",
        options: [
            { text: "I am building technology that solves real problems.", scores: { technology: 3, engineering: 2 } },
            { text: "I am making discoveries that improve our understanding of the world.", scores: { science: 3 } },
            { text: "I am helping people live healthier and happier lives.", scores: { healthcare: 3, psychology: 2 } },
            { text: "I am creating meaningful designs, stories or media.", scores: { creative: 3, media: 3, design: 2 } },
            { text: "I am leading teams and building successful projects.", scores: { leadership: 3, management: 3, business: 2 } },
            { text: "I am teaching, mentoring or helping others grow.", scores: { education: 3, psychology: 2 } }
        ]
    }

];
// ========================================
// NAVENTRA CAREER ASSESSMENT ENGINE
// ========================================

let currentAssessmentQuestion = 0;
let assessmentAnswers = [];


// Start Assessment
if (startAssessmentBtn) {
    startAssessmentBtn.addEventListener("click", () => {

        currentAssessmentQuestion = 0;
        assessmentAnswers = [];

        if (assessmentIntro) {
            assessmentIntro.style.display = "none";
        }

        if (assessmentResults) {
            assessmentResults.style.display = "none";
        }

        if (assessmentQuestions) {
            assessmentQuestions.style.display = "block";
        }

        showAssessmentQuestion();
    });
}


// Show current question
function showAssessmentQuestion() {

    const question =
        careerAssessmentQuestions[currentAssessmentQuestion];

    if (!question) return;


    // Question number
    if (assessmentQuestionNumber) {
        assessmentQuestionNumber.textContent =
            `Question ${currentAssessmentQuestion + 1} of ${careerAssessmentQuestions.length}`;
    }


    // Progress percentage
    const progress =
        Math.round(
            ((currentAssessmentQuestion + 1) /
                careerAssessmentQuestions.length) * 100
        );

    if (assessmentProgressPercent) {
        assessmentProgressPercent.textContent =
            `${progress}%`;
    }


    if (assessmentProgressFill) {
        assessmentProgressFill.style.width =
            `${progress}%`;
    }


    // Question text
    if (assessmentQuestion) {
        assessmentQuestion.textContent =
            question.question;
    }


    // Clear previous options
    if (assessmentOptions) {
        assessmentOptions.innerHTML = "";
    }


    // Create options
    question.options.forEach((option, index) => {

        const optionButton =
            document.createElement("button");

        optionButton.type = "button";
        optionButton.className = "assessment-option";

        optionButton.textContent = option.text;

        optionButton.dataset.index = index;


        // Restore previous answer
        const savedAnswer =
            assessmentAnswers[currentAssessmentQuestion];

        if (question.type === "multiple") {

            if (
                Array.isArray(savedAnswer) &&
                savedAnswer.includes(index)
            ) {
                optionButton.classList.add("selected");
            }

        } else {

            if (savedAnswer === index) {
                optionButton.classList.add("selected");
            }

        }


        optionButton.addEventListener("click", () => {

            // MULTIPLE CHOICE
            if (question.type === "multiple") {

                let selected =
                    assessmentAnswers[currentAssessmentQuestion];

                if (!Array.isArray(selected)) {
                    selected = [];
                }


                if (selected.includes(index)) {

                    selected =
                        selected.filter(
                            item => item !== index
                        );

                    optionButton.classList.remove("selected");

                } else {

                    selected.push(index);

                    optionButton.classList.add("selected");
                }


                assessmentAnswers[currentAssessmentQuestion] =
                    selected;

            }

            // SINGLE CHOICE
            else {

                assessmentAnswers[currentAssessmentQuestion] =
                    index;


                document
                    .querySelectorAll(".assessment-option")
                    .forEach(button => {
                        button.classList.remove("selected");
                    });


                optionButton.classList.add("selected");
            }

        });


        assessmentOptions.appendChild(optionButton);

    });


    // Back button
    if (assessmentBackBtn) {

        if (currentAssessmentQuestion === 0) {
            assessmentBackBtn.style.visibility = "hidden";
        } else {
            assessmentBackBtn.style.visibility = "visible";
        }

    }


    // Next button text
    if (assessmentNextBtn) {

        if (
            currentAssessmentQuestion ===
            careerAssessmentQuestions.length - 1
        ) {
            assessmentNextBtn.textContent =
                "View My Results →";
        } else {
            assessmentNextBtn.textContent =
                "Next →";
        }

    }

}


// Next button
if (assessmentNextBtn) {

    assessmentNextBtn.addEventListener("click", () => {

        const currentQuestion =
            careerAssessmentQuestions[currentAssessmentQuestion];

        const answer =
            assessmentAnswers[currentAssessmentQuestion];


        // Make sure the student answered
        if (
            answer === undefined ||
            answer === null ||
            (Array.isArray(answer) && answer.length === 0)
        ) {

            alert("Please select an answer before continuing.");

            return;
        }


        // Last question
        if (
            currentAssessmentQuestion ===
            careerAssessmentQuestions.length - 1
        ) {

            calculateCareerResults();

            return;
        }


        currentAssessmentQuestion++;

        showAssessmentQuestion();

    });

}

// ========================================
// LOAD LATEST ASSESSMENT RESULT
// ========================================

async function loadLatestAssessmentResult() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "Could not get logged-in user:",
            userError
        );

        return;

    }


    const {
        data: latestAssessment,
        error: assessmentError
    } = await supabaseClient
        .from("career_assessments")
        .select("*")
        .eq("student_id", user.id)
        .eq("status", "completed")
        .order("attempt_number", {
            ascending: false
        })
        .limit(1)
        .maybeSingle();


    if (assessmentError) {

        console.error(
            "Error loading assessment:",
            assessmentError
        );

        return;

    }


    // ========================================
    // NO PREVIOUS ASSESSMENT
    // ========================================

    if (!latestAssessment) {

        console.log(
            "No previous assessment found."
        );

        return;

    }


  // ========================================
// GET SAVED RESULTS
// ========================================

const savedData =
    latestAssessment.answers?.answers;


if (
    !savedData ||
    !savedData.rankedCategories
) {

    console.log(
        "Saved assessment has no result data."
    );

    return;

}


    // ========================================
    // RESTORE RESULTS
    // ========================================

    displayCareerResults(
        savedData.rankedCategories
    );


    // ========================================
    // RESTORE ANSWERS
    // ========================================

    if (savedData.responses) {

        assessmentAnswers =
            savedData.responses;

    }


    // ========================================
    // SHOW RESULTS
    // ========================================

    if (assessmentQuestions) {

        assessmentQuestions.style.display =
            "none";

    }


    if (assessmentResults) {

        assessmentResults.style.display =
            "block";

    }


    // ========================================
    // LOG
    // ========================================

    console.log(
        "Loaded previous assessment:",
        latestAssessment.attempt_number
    );

// ========================================
// VIEW PAST ASSESSMENT RESULT
// ========================================

async function viewPastAssessmentResult() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        console.error("Could not get logged-in user:", userError);
        return;
    }

    const {
        data: latestAssessment,
        error: assessmentError
    } = await supabaseClient
        .from("career_assessments")
        .select("*")
        .eq("student_id", user.id)
        .eq("status", "completed")
        .order("attempt_number", {
            ascending: false
        })
        .limit(1)
        .maybeSingle();

    if (assessmentError) {
        console.error(
            "Error loading past assessment:",
            assessmentError
        );

        return;
    }

    if (!latestAssessment) {
        alert("You don't have a previous assessment yet.");
        return;
    }

    const savedData = latestAssessment.answers;

    if (
        !savedData ||
        !savedData.rankedCategories
    ) {
        alert("Your previous assessment result could not be loaded.");
        return;
    }

    // Show the saved career matches
    displayCareerResults(
        savedData.rankedCategories
    );

    // Restore saved answers
    if (savedData.responses) {
        assessmentAnswers = savedData.responses;
    }

    // Hide questions
    if (assessmentQuestions) {
        assessmentQuestions.style.display = "none";
    }

    // Show results
    if (assessmentResults) {
        assessmentResults.style.display = "block";
    }

    console.log(
        "Past assessment displayed:",
        latestAssessment.attempt_number
    );
}
}

// Back button
if (assessmentBackBtn) {

    assessmentBackBtn.addEventListener("click", () => {

        if (currentAssessmentQuestion <= 0) {
            return;
        }

        currentAssessmentQuestion--;

        showAssessmentQuestion();

    });

}


async function calculateCareerResults() {

    const scores = {};

    // ========================================
    // CREATE SCORE CATEGORIES
    // ========================================

    careerAssessmentQuestions.forEach(question => {

        question.options.forEach(option => {

            Object.keys(option.scores).forEach(category => {

                if (!(category in scores)) {
                    scores[category] = 0;
                }

            });

        });

    });


    // ========================================
    // CALCULATE SCORES FROM ANSWERS
    // ========================================

    careerAssessmentQuestions.forEach(
        (question, questionIndex) => {

            const answer =
                assessmentAnswers[questionIndex];

            if (answer === undefined) return;


            // MULTIPLE CHOICE
            if (question.type === "multiple") {

                answer.forEach(selectedIndex => {

                    const selectedOption =
                        question.options[selectedIndex];

                    if (!selectedOption) return;


                    Object.entries(selectedOption.scores)
                        .forEach(([category, points]) => {

                            scores[category] =
                                (scores[category] || 0) + points;

                        });

                });

            }


            // SINGLE CHOICE
            else {

                const selectedOption =
                    question.options[answer];

                if (!selectedOption) return;


                Object.entries(selectedOption.scores)
                    .forEach(([category, points]) => {

                        scores[category] =
                            (scores[category] || 0) + points;

                    });

            }

        }
    );


    // ========================================
    // RANK CAREER CATEGORIES
    // ========================================

    const rankedCategories =
        Object.entries(scores)
            .sort((a, b) => b[1] - a[1]);


    // ========================================
    // DISPLAY RESULTS IMMEDIATELY
    // ========================================

    displayCareerResults(rankedCategories);


    // ========================================
    // GET CURRENT USER
    // ========================================

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "Could not get logged-in user:",
            userError
        );

        return;

    }


    // ========================================
    // GET NEXT ATTEMPT NUMBER
    // ========================================

    const {
        data: previousAttempts,
        error: attemptError
    } = await supabaseClient
        .from("career_assessments")
        .select("attempt_number")
        .eq("student_id", user.id)
        .order("attempt_number", {
            ascending: false
        })
        .limit(1);


    if (attemptError) {

        console.error(
            "Could not get previous attempts:",
            attemptError
        );

        return;

    }


    const nextAttemptNumber =
        previousAttempts &&
        previousAttempts.length > 0
            ? Number(previousAttempts[0].attempt_number) + 1
            : 1;


    // ========================================
    // SAVE ASSESSMENT TO SUPABASE
    // ========================================

    const assessmentData = {

        answers: {

            responses: assessmentAnswers,

            scores: scores,

            rankedCategories: rankedCategories

        }

    };


    const {
        data: savedAssessment,
        error: saveError
    } = await supabaseClient
        .from("career_assessments")
        .insert([{

            student_id: user.id,

            status: "completed",

            answers: assessmentData,

            attempt_number: nextAttemptNumber

        }])
        .select()
        .single();


    if (saveError) {

        console.error(
            "Error saving assessment:",
            saveError
        );

        alert(
            "Your results were calculated, but they could not be saved. Please try again."
        );

        return;

    }


    console.log(
        "Assessment saved successfully:",
        savedAssessment
    );

}


// ========================================
// CAREER DATABASE
// ========================================

const careerDatabase = {

    technology: {
        title: "Technology & Computing",
        icon: "💻",
        careers: [
            "Software Developer",
            "Artificial Intelligence Engineer",
            "Data Scientist",
            "Cybersecurity Analyst"
        ],
        description:
            "You may enjoy solving problems with technology, programming and digital systems."
    },

    engineering: {
        title: "Engineering",
        icon: "⚙️",
        careers: [
            "Mechanical Engineer",
            "Civil Engineer",
            "Electrical Engineer",
            "Robotics Engineer"
        ],
        description:
            "Your analytical and problem-solving interests could fit careers focused on designing and building solutions."
    },

    science: {
        title: "Science & Research",
        icon: "🔬",
        careers: [
            "Research Scientist",
            "Environmental Scientist",
            "Biotechnologist",
            "Chemist"
        ],
        description:
            "You may enjoy discovering how the world works through research, experiments and evidence."
    },

    healthcare: {
        title: "Healthcare & Medicine",
        icon: "🩺",
        careers: [
            "Doctor",
            "Pharmacist",
            "Physiotherapist",
            "Medical Researcher"
        ],
        description:
            "Your interest in helping people and understanding health could lead toward healthcare careers."
    },

    psychology: {
        title: "Psychology & Human Behaviour",
        icon: "🧠",
        careers: [
            "Psychologist",
            "Counsellor",
            "Behavioural Researcher",
            "Human Resources Specialist"
        ],
        description:
            "You may be interested in understanding people, behaviour, emotions and relationships."
    },

    education: {
        title: "Education & Learning",
        icon: "📚",
        careers: [
            "Teacher",
            "Professor",
            "Educational Consultant",
            "Learning Designer"
        ],
        description:
            "You may enjoy teaching, explaining ideas and helping others grow."
    },

    creative: {
        title: "Creative Arts",
        icon: "🎨",
        careers: [
            "Creative Director",
            "Artist",
            "Writer",
            "Content Creator"
        ],
        description:
            "Your creativity and imagination could fit careers where you create original ideas and experiences."
    },

    design: {
        title: "Design",
        icon: "✏️",
        careers: [
            "Graphic Designer",
            "UI/UX Designer",
            "Product Designer",
            "Visual Designer"
        ],
        description:
            "You may enjoy turning ideas into useful and visually appealing designs."
    },

    media: {
        title: "Media & Communication",
        icon: "🎬",
        careers: [
            "Filmmaker",
            "Journalist",
            "Content Producer",
            "Media Strategist"
        ],
        description:
            "Your communication and storytelling interests could fit careers in media and communication."
    },

    business: {
        title: "Business",
        icon: "💼",
        careers: [
            "Business Analyst",
            "Entrepreneur",
            "Marketing Specialist",
            "Financial Analyst"
        ],
        description:
            "You may enjoy strategy, business decisions and finding opportunities."
    },

    management: {
        title: "Management",
        icon: "📊",
        careers: [
            "Project Manager",
            "Operations Manager",
            "Product Manager",
            "Business Consultant"
        ],
        description:
            "Your organizational skills could fit careers involving planning, coordination and execution."
    },

    leadership: {
        title: "Leadership",
        icon: "🌟",
        careers: [
            "Team Leader",
            "Entrepreneur",
            "Project Director",
            "Organization Manager"
        ],
        description:
            "You may enjoy taking responsibility, motivating others and leading projects."
    },

    environment: {
        title: "Environment & Sustainability",
        icon: "🌱",
        careers: [
            "Environmental Scientist",
            "Sustainability Consultant",
            "Environmental Engineer",
            "Conservation Scientist"
        ],
        description:
            "Your interest in the environment could lead toward careers focused on protecting our planet."
    }

};


// ========================================
// DISPLAY CAREER RESULTS
// ========================================

function displayCareerResults(rankedCategories) {

    if (!careerResultsList) return;


    // Take top 5 career areas
    const topResults =
        rankedCategories
            .filter(([category, score]) => score > 0)
            .slice(0, 8);



    if (topResults.length > 0) {

        careerResultsList.innerHTML = `
    <div class="career-results-intro">
        <span class="section-label">YOUR TOP CAREER MATCHES</span>
        <h3>Careers that match your interests</h3>
        <p>
            These results are based on your assessment responses.
            They are a guide to help you explore possibilities, not a prediction of your future.
        </p>
    </div>

    <div class="top-career-matches">

        ${topResults.slice(0, 3).map(
            ([category, score], index) => {

                const career = careerDatabase[category];

                if (!career) return "";

                const maxScore = topResults[0][1];

                const percentage = Math.round(
                    (score / maxScore) * 100
                );

                const cardColors = [
                    "career-card-purple",
                    "career-card-orange",
                    "career-card-green"
                ];

                return `
                <article class="career-result-card ${cardColors[index] || "career-card-purple"}">

                    <div class="career-card-top">

                        <div class="career-result-icon">
                            ${career.icon}
                        </div>

                        <span class="career-match-label">
                            BEST MATCH ${index + 1}
                        </span>

                    </div>


                    <div class="career-result-content">

                        <h3>
                            ${career.title}
                        </h3>

                        <span class="career-field">
                            ${career.field || career.category || "Career Path"}
                        </span>


                        <div class="career-match-score">
                            <strong>${percentage}%</strong>
                            <span>match</span>
                        </div>


                        <p class="career-description">
                            ${career.description}
                        </p>


                        <div class="career-why-match">

                            <h4>Why it matches you</h4>

                            <ul>

                                ${(career.strengths || career.skills || [
                                    "Strong communication skills",
                                    "Analytical thinking",
                                    "Problem solving"
                                ]).slice(0, 4).map(
                                    skill => `
                                    <li>
                                        <span>✓</span>
                                        ${skill}
                                    </li>
                                    `
                                ).join("")}

                            </ul>

                        </div>


                        <div class="career-result-actions">

                            <button
    type="button"
    class="career-roadmap-btn"
    data-career="${category}"
    data-match="${percentage}"
>
    🗺️ Roadmap
</button>

                            <button
                                type="button"
                                class="career-save-btn"
                                data-career="${category}"
                            >
                                💜 Save
                            </button>

                        </div>

                    </div>

                </article>
                `;
            }
        ).join("")}

    </div>


    <div class="more-careers-section">

        <div class="more-careers-heading">

            <span class="section-label">
                KEEP EXPLORING
            </span>

            <h3>
                More matches to explore
            </h3>

            <p>
                These careers also showed a strong connection
                with your assessment results.
            </p>

        </div>


        <div class="more-careers-grid">

            ${topResults.slice(3).map(
                ([category, score], index) => {

                    const career =
                        careerDatabase[category];

                    if (!career) return "";

                    const maxScore =
                        topResults[0][1];

                    const percentage =
                        Math.round(
                            (score / maxScore) * 100
                        );

                    return `
                    <article class="more-career-card">

                        <div class="more-career-icon">
                            ${career.icon}
                        </div>

                        <div class="more-career-content">

                            <h4>
                                ${career.title}
                            </h4>

                            <span>
                                ${career.field || career.category || "Career Path"}
                            </span>

                            <strong>
                                ${percentage}% Match
                            </strong>

                            <p>
                                ${career.description}
                            </p>

                        </div>


                        <div class="more-career-actions">

                            <button
    type="button"
    class="career-roadmap-btn"
    data-career="${category}"
    data-match="${percentage}"
>
    🗺️ Roadmap
</button>

                            <button
                                type="button"
                                class="career-save-btn"
                                data-career="${category}"
                            >
                                💜 Save
                            </button>

                        </div>

                    </article>
                    `;
                }
            ).join("")}

        </div>

    </div>
`;


    // Hide questions
    if (assessmentQuestions) {
        assessmentQuestions.style.display = "none";
    }


    // Show results
    if (assessmentResults) {
        assessmentResults.style.display = "block";
    }

}



// ========================================
// SAVE CAREER FROM ASSESSMENT RESULTS
// ========================================

document.addEventListener("click", async (event) => {

    const saveButton =
        event.target.closest(".career-save-btn");

    if (!saveButton) return;

    const category =
        saveButton.dataset.career;

    if (!category) return;

    const career =
        careerDatabase[category];

    if (!career) {
        console.error(
            "Career not found:",
            category
        );
        return;
    }

    await saveCareerToSupabase(
        category,
        career
    );

});

// ========================================
// RETAKE ASSESSMENT
// ========================================

if (retakeAssessmentBtn) {

    retakeAssessmentBtn.addEventListener(
        "click",
        () => {

            currentAssessmentQuestion = 0;

            assessmentAnswers = [];


            // Hide old results

            if (assessmentResults) {

                assessmentResults.style.display =
                    "none";

            }


            // Show assessment intro

            if (assessmentIntro) {

                assessmentIntro.style.display =
                    "block";

            }


            // Show questions again

            if (assessmentQuestions) {

                assessmentQuestions.style.display =
                    "block";

            }


            // Reset question display

            showAssessmentQuestion();

        }
    );

}
// ========================================
// TOP HEADER NAVIGATION
// ========================================

const topNotificationBtn =
    document.getElementById("notificationBtn");

if (topNotificationBtn) {

    topNotificationBtn.addEventListener("click", () => {

        const notificationsLink =
            document.querySelector(
                '.sidebar-link[data-page="notifications"]'
            );

        if (notificationsLink) {
            notificationsLink.click();
        }

    });

}
// ========================================
// TOP PROFILE NAVIGATION
// ========================================

const topProfileBtn =
    document.getElementById("profileTopBtn");

if (topProfileBtn) {

    topProfileBtn.addEventListener("click", () => {

        const profileLink =
            document.querySelector(
                '.sidebar-link[data-page="profile"]'
            );

        if (profileLink) {
            profileLink.click();
        }

    });

}
// ========================================
// CAREER ROADMAP MODAL
// ========================================

// ========================================
// CAREER ROADMAP DATABASE
// ========================================

const careerRoadmaps = {

    technology: {
        title: "Software Developer",
        category: "Technology",
        description: "Builds digital products, applications and systems that solve real-world problems.",

        whyMatches: [
            "Strong logical thinking",
            "Enjoys technology and problem solving",
            "Interest in Computer Science",
            "Enjoys building and experimenting"
        ],

        roadmap: [
            ["📚", "Mathematics & Computer Science"],
            ["🎓", "Science / Computer Science Stream"],
            ["💻", "Computer Science Degree"],
            ["🧑‍💻", "Programming & Projects"],
            ["🚀", "Internships & Experience"],
            ["💼", "Software Developer"]
        ],

        skills: [
            "Programming",
            "Problem solving",
            "Logical thinking",
            "Communication"
        ],

        subjects: [
            "Mathematics",
            "Computer Science",
            "Physics"
        ],

        universityCourses: [
            "BSc Computer Science",
            "BSc Software Engineering",
            "BSc Artificial Intelligence"
        ],

        opportunities: [
            "Software Engineer",
            "AI Engineer",
            "Web Developer",
            "Data Scientist"
        ]
    },


    engineering: {
        title: "Engineer",
        category: "Engineering",
        description: "Designs, builds and improves systems, machines and solutions to real-world problems.",

        whyMatches: [
            "Strong problem-solving ability",
            "Interest in Mathematics and Physics",
            "Enjoys building and experimenting",
            "Analytical thinking"
        ],

        roadmap: [
            ["📐", "Mathematics & Physics"],
            ["🎓", "Science Stream"],
            ["⚙️", "Engineering Degree"],
            ["🔧", "Technical Projects"],
            ["🏗️", "Internships"],
            ["💼", "Engineer"]
        ],

        skills: [
            "Problem solving",
            "Mathematics",
            "Analytical thinking",
            "Technical skills"
        ],

        subjects: [
            "Mathematics",
            "Physics",
            "Chemistry"
        ],

        universityCourses: [
            "BTech Engineering",
            "BSc Engineering",
            "BEng Engineering"
        ],

        opportunities: [
            "Mechanical Engineer",
            "Civil Engineer",
            "Electrical Engineer",
            "Robotics Engineer"
        ]
    },


    science: {
        title: "Research Scientist",
        category: "Science",
        description: "Investigates questions about the world through experiments, evidence and scientific research.",

        whyMatches: [
            "Loves research & discovery",
            "Enjoys scientific investigation",
            "Strong analytical thinking",
            "Interest in experiments"
        ],

        roadmap: [
            ["🔬", "Science & Mathematics"],
            ["🎓", "Science Stream"],
            ["🧪", "Science Degree"],
            ["📖", "Research Experience"],
            ["🔬", "Research Projects"],
            ["🧬", "Research Scientist"]
        ],

        skills: [
            "Research",
            "Analytical thinking",
            "Observation",
            "Problem solving"
        ],

        subjects: [
            "Biology",
            "Chemistry",
            "Physics",
            "Mathematics"
        ],

        universityCourses: [
            "BSc Biology",
            "BSc Chemistry",
            "BSc Physics",
            "BSc Environmental Science"
        ],

        opportunities: [
            "Research Scientist",
            "Biotechnologist",
            "Environmental Scientist",
            "Chemist"
        ]
    },


    healthcare: {
        title: "Doctor",
        category: "Healthcare",
        description: "Diagnoses health conditions and helps people through medical knowledge, treatment and care.",

        whyMatches: [
            "Strong interest in Biology",
            "Enjoys helping people",
            "Interest in health and science",
            "Strong sense of responsibility"
        ],

        roadmap: [
            ["🧬", "Biology & Chemistry"],
            ["🎓", "Science Stream"],
            ["🩺", "Medical Degree"],
            ["🏥", "Clinical Training"],
            ["👩‍⚕️", "Medical Internship"],
            ["🩺", "Doctor"]
        ],

        skills: [
            "Communication",
            "Scientific thinking",
            "Empathy",
            "Decision making"
        ],

        subjects: [
            "Biology",
            "Chemistry",
            "Physics"
        ],

        universityCourses: [
            "MBBS",
            "BSc Medical Sciences",
            "Biomedical Sciences"
        ],

        opportunities: [
            "Doctor",
            "Medical Researcher",
            "Surgeon",
            "Medical Specialist"
        ]
    },


    psychology: {
        title: "Psychologist",
        category: "Psychology",
        description: "Studies human behaviour, thoughts and emotions and helps people understand themselves and others.",

        whyMatches: [
            "Interested in human behaviour",
            "Strong communication skills",
            "Enjoys helping others",
            "Curious about emotions and relationships"
        ],

        roadmap: [
            ["📚", "Psychology & Social Studies"],
            ["🎓", "Any Stream"],
            ["🧠", "Psychology Degree"],
            ["🔎", "Research & Practice"],
            ["💬", "Supervised Experience"],
            ["🧠", "Psychologist"]
        ],

        skills: [
            "Communication",
            "Research",
            "Empathy",
            "Critical thinking"
        ],

        subjects: [
            "Psychology",
            "Social Studies",
            "Biology"
        ],

        universityCourses: [
            "BA Psychology",
            "BSc Psychology",
            "Behavioural Science"
        ],

        opportunities: [
            "Psychologist",
            "Counsellor",
            "Behavioural Researcher",
            "Human Resources Specialist"
        ]
    },


    education: {
        title: "Teacher",
        category: "Education",
        description: "Helps students learn, develop skills and understand ideas through teaching and mentoring.",

        whyMatches: [
            "Strong communication skills",
            "Enjoys explaining ideas",
            "Likes helping others learn",
            "Patient and supportive"
        ],

        roadmap: [
            ["📚", "Strong Subject Knowledge"],
            ["🎓", "Any Stream"],
            ["📖", "Education Degree"],
            ["👩‍🏫", "Teaching Practice"],
            ["🏫", "School Experience"],
            ["👩‍🏫", "Teacher"]
        ],

        skills: [
            "Communication",
            "Leadership",
            "Patience",
            "Presentation"
        ],

        subjects: [
            "Languages",
            "Social Studies",
            "Your chosen subject"
        ],

        universityCourses: [
            "BA Education",
            "BEd",
            "Subject-specific Degree"
        ],

        opportunities: [
            "Teacher",
            "Professor",
            "Educational Consultant",
            "Learning Designer"
        ]
    },


    creative: {
        title: "Creative Director",
        category: "Creative Arts",
        description: "Develops creative ideas and leads visual, artistic and storytelling projects.",

        whyMatches: [
            "Strong creative expression",
            "Enjoys generating ideas",
            "Loves storytelling",
            "Enjoys artistic projects"
        ],

        roadmap: [
            ["🎨", "Art & Creative Subjects"],
            ["🎓", "Arts / Creative Stream"],
            ["🎬", "Creative Degree"],
            ["📁", "Build a Portfolio"],
            ["🚀", "Creative Internships"],
            ["🎨", "Creative Director"]
        ],

        skills: [
            "Creativity",
            "Storytelling",
            "Communication",
            "Visual thinking"
        ],

        subjects: [
            "Art",
            "Media",
            "Languages"
        ],

        universityCourses: [
            "BA Fine Arts",
            "BA Creative Arts",
            "BA Film & Media"
        ],

        opportunities: [
            "Creative Director",
            "Writer",
            "Artist",
            "Content Creator"
        ]
    },


    design: {
        title: "UI/UX Designer",
        category: "Design",
        description: "Designs digital experiences that are useful, accessible and visually engaging.",

        whyMatches: [
            "Strong visual creativity",
            "Enjoys designing things",
            "Good problem-solving ability",
            "Interest in digital products"
        ],

        roadmap: [
            ["🎨", "Art & Design"],
            ["🎓", "Any Stream"],
            ["✏️", "Design Degree"],
            ["💻", "UI/UX Projects"],
            ["📁", "Design Portfolio"],
            ["🖥️", "UI/UX Designer"]
        ],

        skills: [
            "Creativity",
            "Visual communication",
            "Problem solving",
            "User research"
        ],

        subjects: [
            "Art & Design",
            "Computer Science",
            "Languages"
        ],

        universityCourses: [
            "BA Graphic Design",
            "BDes UI/UX Design",
            "BDes Product Design"
        ],

        opportunities: [
            "UI/UX Designer",
            "Product Designer",
            "Graphic Designer",
            "Visual Designer"
        ]
    },


    media: {
        title: "Journalist",
        category: "Media",
        description: "Investigates and reports stories that matter.",

        whyMatches: [
            "Strong communication skills",
            "Interest in Social Studies",
            "Loves research & discovery",
            "Enjoys creative expression"
        ],

        roadmap: [
            ["🌐", "Languages & Social Studies"],
            ["🎓", "Any Stream (Arts preferred)"],
            ["🎓", "Journalism Degree"],
            ["✍️", "Writing & Reporting"],
            ["💼", "Internships"],
            ["📰", "Journalist"]
        ],

        skills: [
            "Communication",
            "Research",
            "Creativity",
            "Analytical thinking"
        ],

        subjects: [
            "Languages",
            "Social Studies",
            "Arts"
        ],

        universityCourses: [
            "BA Journalism",
            "BA Mass Communication"
        ],

        opportunities: [
            "News Anchor",
            "Editor",
            "Foreign Correspondent",
            "Investigative Reporter"
        ]
    },


    business: {
        title: "Business Analyst",
        category: "Business",
        description: "Uses data, research and business knowledge to help organisations make better decisions.",

        whyMatches: [
            "Strong analytical thinking",
            "Interest in business",
            "Enjoys solving practical problems",
            "Good decision-making skills"
        ],

        roadmap: [
            ["📊", "Mathematics & Business"],
            ["🎓", "Commerce / Business Stream"],
            ["🎓", "Business Degree"],
            ["📈", "Business Projects"],
            ["💼", "Internships"],
            ["📊", "Business Analyst"]
        ],

        skills: [
            "Analysis",
            "Communication",
            "Problem solving",
            "Decision making"
        ],

        subjects: [
            "Mathematics",
            "Economics",
            "Business Studies"
        ],

        universityCourses: [
            "BBA",
            "BCom",
            "Business Analytics"
        ],

        opportunities: [
            "Business Analyst",
            "Entrepreneur",
            "Marketing Specialist",
            "Financial Analyst"
        ]
    },


    management: {
        title: "Project Manager",
        category: "Management",
        description: "Plans and coordinates teams and projects to turn ideas into successful results.",

        whyMatches: [
            "Strong organisational skills",
            "Enjoys planning",
            "Natural leadership ability",
            "Good teamwork skills"
        ],

        roadmap: [
            ["📋", "Organisation & Communication"],
            ["🎓", "Any Stream"],
            ["🎓", "Business / Management Degree"],
            ["📊", "Project Experience"],
            ["🤝", "Management Internships"],
            ["📋", "Project Manager"]
        ],

        skills: [
            "Leadership",
            "Organisation",
            "Communication",
            "Time management"
        ],

        subjects: [
            "Business Studies",
            "Mathematics",
            "Languages"
        ],

        universityCourses: [
            "BBA",
            "BSc Management",
            "Project Management"
        ],

        opportunities: [
            "Project Manager",
            "Operations Manager",
            "Product Manager",
            "Business Consultant"
        ]
    },


    leadership: {
        title: "Entrepreneur",
        category: "Leadership",
        description: "Builds ideas, teams and organisations while taking responsibility for turning opportunities into action.",

        whyMatches: [
            "Confident decision-making",
            "Enjoys taking responsibility",
            "Strong leadership ability",
            "Enjoys ambitious goals"
        ],

        roadmap: [
            ["🌟", "Build Leadership Skills"],
            ["🎓", "Any Stream"],
            ["🎓", "Business Education"],
            ["💡", "Develop a Business Idea"],
            ["🚀", "Launch & Gain Experience"],
            ["💼", "Entrepreneur"]
        ],

        skills: [
            "Leadership",
            "Communication",
            "Decision making",
            "Creativity"
        ],

        subjects: [
            "Business Studies",
            "Economics",
            "Mathematics"
        ],

        universityCourses: [
            "BBA",
            "BCom",
            "Entrepreneurship"
        ],

        opportunities: [
            "Entrepreneur",
            "Startup Founder",
            "Project Director",
            "Business Leader"
        ]
    },


    environment: {
        title: "Environmental Scientist",
        category: "Environment",
        description: "Studies environmental systems and develops ways to understand and protect the natural world.",

        whyMatches: [
            "Interest in the environment",
            "Enjoys scientific discovery",
            "Strong research skills",
            "Cares about real-world impact"
        ],

        roadmap: [
            ["🌱", "Biology & Environmental Science"],
            ["🎓", "Science Stream"],
            ["🔬", "Environmental Science Degree"],
            ["🌍", "Research Projects"],
            ["🚀", "Field Experience"],
            ["🌱", "Environmental Scientist"]
        ],

        skills: [
            "Research",
            "Scientific thinking",
            "Analysis",
            "Problem solving"
        ],

        subjects: [
            "Biology",
            "Chemistry",
            "Geography"
        ],

        universityCourses: [
            "BSc Environmental Science",
            "BSc Sustainability",
            "Environmental Engineering"
        ],

        opportunities: [
            "Environmental Scientist",
            "Sustainability Consultant",
            "Conservation Scientist",
            "Environmental Engineer"
        ]
    }

};


// ========================================
// OPEN CAREER ROADMAP
// ========================================

function openCareerRoadmap(category, matchPercentage = 66) {

    const roadmap = careerRoadmaps[category];

    if (!roadmap) {
        console.log("No roadmap found for:", category);
        return;
    }

    let modal =
        document.getElementById("careerRoadmapModal");

    if (!modal) {

        modal = document.createElement("div");

        modal.id = "careerRoadmapModal";
        modal.className = "career-roadmap-modal";

        document.body.appendChild(modal);
    }


    modal.innerHTML = `

        <div class="career-roadmap-overlay">

            <div class="career-roadmap-content">

                <button
                    type="button"
                    class="career-roadmap-close"
                    id="careerRoadmapClose"
                    aria-label="Close roadmap"
                >
                    ×
                </button>


                <!-- CAREER HEADER -->

                <div class="career-roadmap-header">

                    <span class="section-label">
                        ${roadmap.category}
                    </span>

                    <h2>
                        ${roadmap.title}
                    </h2>

                    <div class="career-roadmap-match">

                        <strong>
                            ${matchPercentage}%
                        </strong>

                        <span>
                            match based on your assessment — a guide, not a guarantee.
                        </span>

                    </div>

                    <p class="career-roadmap-description">
                        ${roadmap.description}
                    </p>

                </div>


                <!-- WHY IT MATCHES -->

                <section class="roadmap-detail-section">

                    <h3>
                        Why it matches you
                    </h3>

                    <ul class="roadmap-bullet-list">

                        ${roadmap.whyMatches.map(item => `
                            <li>
                                <span>✓</span>
                                ${item}
                            </li>
                        `).join("")}

                    </ul>

                </section>


                <!-- CAREER ROADMAP -->

                <section class="roadmap-detail-section">

                    <h3>
                        Career Roadmap
                    </h3>

                    <div class="career-roadmap-timeline">

                        ${roadmap.roadmap.map((step, index) => `

                            <div class="roadmap-step">

                                <div class="roadmap-step-marker">
                                    ${step[0]}
                                </div>

                                <div class="roadmap-step-content">

                                    <span class="roadmap-step-number">
                                        STEP ${index + 1}
                                    </span>

                                    <h3>
                                        ${step[1]}
                                    </h3>

                                </div>

                            </div>

                        `).join("")}

                    </div>

                </section>


                <!-- KEY SKILLS -->

                <section class="roadmap-detail-section">

                    <h3>
                        Key skills
                    </h3>

                    <div class="roadmap-tag-list">

    ${roadmap.skills.map(skill => `
        <span class="roadmap-tag">
            ${skill}
        </span>
    `).join("")}

</div>
                </section>


                <!-- RECOMMENDED SUBJECTS -->

                <section class="roadmap-detail-section">

                    <h3>
                        Recommended subjects
                    </h3>

                    <div class="roadmap-tag-list">

    ${roadmap.subjects.map(subject => `
        <span class="roadmap-tag">
            ${subject}
        </span>
    `).join("")}

</div>

                </section>


                <!-- UNIVERSITY COURSES -->

                <section class="roadmap-detail-section">

                    <h3>
                        University courses
                    </h3>

                    <ul class="roadmap-course-list">

    ${roadmap.universityCourses.map(course => `
        <li>
            <span class="course-check">✓</span>
            ${course}
        </li>
    `).join("")}

</ul>

                </section>


                <!-- FUTURE OPPORTUNITIES -->

                <section class="roadmap-detail-section">

                    <h3>
                        Future opportunities
                    </h3>

                    <div class="roadmap-tag-list">

    ${roadmap.opportunities.map(opportunity => `
        <span class="roadmap-tag">
            ${opportunity}
        </span>
    `).join("")}

</div>

                </section>

            </div>

        </div>

    `;


    modal.classList.add("active");


    // Close button

    const closeButton =
        document.getElementById("careerRoadmapClose");

    if (closeButton) {

        closeButton.addEventListener("click", () => {

            modal.classList.remove("active");

        });

    }


    // Close when clicking outside

    const overlay =
        modal.querySelector(".career-roadmap-overlay");

    if (overlay) {

        overlay.addEventListener("click", (event) => {

            if (event.target === overlay) {

                modal.classList.remove("active");

            }

        });

    }

}


// ========================================
// ROADMAP BUTTON CLICK
// ========================================

document.addEventListener("click", (event) => {

    const roadmapButton =
        event.target.closest(".career-roadmap-btn");

    if (!roadmapButton) return;

    const category =
        roadmapButton.dataset.career;

    /*
       The assessment result already knows
       the career category. For now we use
       the displayed match percentage.
    */

    const matchPercentage =
        roadmapButton.dataset.match || 66;

    openCareerRoadmap(
        category,
        matchPercentage
    );

});


// ========================================
// CLOSE ROADMAP WHEN CHANGING PORTAL PAGE
// ========================================

document.addEventListener("click", (event) => {

    const sidebarLink =
        event.target.closest(".sidebar-link");

    if (!sidebarLink) return;

    const roadmapModal =
        document.getElementById("careerRoadmapModal");

    if (roadmapModal) {

        roadmapModal.classList.remove("active");

    }

});


// ========================================
// CLOSE ROADMAP WITH ESCAPE KEY
// ========================================

document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    const roadmapModal =
        document.getElementById("careerRoadmapModal");

    if (roadmapModal) {

        roadmapModal.classList.remove("active");

    }

});
// ========================================
// DISPLAY SAVED CAREERS
// ========================================

// ========================================
// DISPLAY SAVED CAREERS
// ========================================

function loadSavedCareers() {

    const savedCareers =
        JSON.parse(localStorage.getItem("naventraSavedCareers")) || [];

    const dashboardContainer =
        document.getElementById("dashboardSavedCareers");

    const savedCareersPage =
        document.getElementById("savedCareersPage");

    const savedCount =
        document.getElementById("savedCareersCount");


    // Update dashboard count
    if (savedCount) {
        savedCount.textContent = savedCareers.length;
    }


    // If there are no saved careers
    if (savedCareers.length === 0) {

        const emptyMessage = `
            <div class="empty-state">
                <h3>No saved careers yet</h3>
                <p>
                    Save careers from your assessment results
                    to keep them here for later.
                </p>
            </div>
        `;

        if (dashboardContainer) {
            dashboardContainer.innerHTML = emptyMessage;
        }

        if (savedCareersPage) {
            savedCareersPage.innerHTML = `
                <div class="portal-page-header">

                    <span class="section-label">
                        YOUR CAREER PICKS
                    </span>

                    <h2>Saved Careers</h2>

                    <p>
                        Keep your favourite career paths here
                        and explore them whenever you're ready.
                    </p>

                </div>

                <div class="saved-careers-page-grid">
                    ${emptyMessage}
                </div>
            `;
        }

        return;
    }




    // Create saved career cards
    const createSavedCareerCard = (category) => {

        const career = careerDatabase[category];

        if (!career) return "";

        return `
            <article class="career-result-card saved-career-card">

                <div class="career-card-top">

                    <div class="career-result-icon">
                        ${career.icon}
                    </div>

                    <span class="career-match-label">
                        SAVED CAREER
                    </span>

                </div>


                <div class="career-result-content">

                    <h3>
                        ${career.title}
                    </h3>

                    <span class="career-field">
                        ${career.field || career.category || "Career Path"}
                    </span>


                    <p class="career-description">
                        ${career.description}
                    </p>


                    <div class="career-result-actions">

                        <button
                            type="button"
                            class="career-roadmap-btn"
                            data-career="${category}"
                        >
                            🗺️ Roadmap
                        </button>

                        <button
                            type="button"
                            class="career-save-btn saved"
                            data-career="${category}"
                        >
                            💜 Saved
                        </button>

                    </div>

                </div>

            </article>
        `;
    };


    // ========================================
    // DASHBOARD
    // ========================================

    if (dashboardContainer) {

        const dashboardCareers =
            savedCareers.slice(0, 3);

        dashboardContainer.innerHTML =
            dashboardCareers
                .map(createSavedCareerCard)
                .join("");

    }


    // ========================================
    // SAVED CAREERS PAGE
    // ========================================

    if (savedCareersPage) {

        savedCareersPage.innerHTML = `

            <div class="portal-page-header">

                <span class="section-label">
                    YOUR CAREER PICKS
                </span>

                <h2>
                    Saved Careers
                </h2>

                <p>
                    Keep your favourite career paths here
                    and explore them whenever you're ready.
                </p>

            </div>


            <div class="saved-careers-page-grid">

                ${savedCareers
                    .map(createSavedCareerCard)
                    .join("")}

            </div>

        `;
    }

}

// ========================================
// NAVENTRA CAREER EXPLORER
// 120+ CAREERS
// ========================================

const careerExplorerDatabase = {

    // ==============================
    // TECHNOLOGY & AI
    // ==============================

    ai_ml_engineer: {
        title: "AI & Machine Learning Engineer",
        field: "Technology & AI",
        icon: "🤖",
        outlook: "Very High Growth",
        trendScore: 98,
        description: "Designs and develops intelligent systems that can learn from data and solve complex problems.",
        skills: ["Python", "Mathematics", "Machine Learning", "Problem Solving"],
        education: "Bachelor's degree in Computer Science, AI, Data Science or a related field.",
        roadmap: [
            "Build strong mathematics and programming foundations",
            "Learn Python and data structures",
            "Study machine learning and artificial intelligence",
            "Build AI projects and portfolios",
            "Complete internships or research projects",
            "Specialize in an AI field"
        ]
    },

    data_scientist: {
        title: "Data Scientist",
        field: "Technology & AI",
        icon: "📊",
        outlook: "Very High Growth",
        trendScore: 97,
        description: "Uses data, statistics and computing to discover patterns and support decision-making.",
        skills: ["Statistics", "Python", "Data Analysis", "Critical Thinking"],
        education: "Bachelor's or Master's degree in Data Science, Statistics, Mathematics or Computer Science.",
        roadmap: [
            "Learn mathematics and statistics",
            "Learn Python or R",
            "Study databases and data analysis",
            "Learn machine learning",
            "Create data projects",
            "Build a professional portfolio"
        ]
    },

    data_analyst: {
        title: "Data Analyst",
        field: "Technology & AI",
        icon: "📈",
        outlook: "High Growth",
        trendScore: 91,
        description: "Turns raw information into useful insights that organizations can use.",
        skills: ["Excel", "SQL", "Statistics", "Data Visualization"],
        education: "Degree or relevant qualification in data, business, mathematics or computing.",
        roadmap: [
            "Learn spreadsheets",
            "Learn SQL",
            "Study statistics",
            "Learn data visualization",
            "Complete practical projects",
            "Build a portfolio"
        ]
    },

    software_developer: {
        title: "Software Developer",
        field: "Technology & AI",
        icon: "💻",
        outlook: "High Growth",
        trendScore: 94,
        description: "Creates applications, websites and software systems used by people and organizations.",
        skills: ["Programming", "Logic", "Problem Solving", "Software Design"],
        education: "Computer Science, Software Engineering or related education.",
        roadmap: [
            "Learn programming fundamentals",
            "Choose a programming language",
            "Learn algorithms and data structures",
            "Build applications",
            "Learn version control",
            "Gain internship experience"
        ]
    },

    web_developer: {
        title: "Web Developer",
        field: "Technology & AI",
        icon: "🌐",
        outlook: "High Growth",
        trendScore: 88,
        description: "Builds and maintains websites and web applications.",
        skills: ["HTML", "CSS", "JavaScript", "Problem Solving"],
        education: "Computer Science, Web Development or relevant practical training.",
        roadmap: [
            "Learn HTML",
            "Learn CSS",
            "Learn JavaScript",
            "Build websites",
            "Learn backend development",
            "Create a portfolio"
        ]
    },

    cybersecurity_analyst: {
        title: "Cybersecurity Analyst",
        field: "Technology & AI",
        icon: "🔐",
        outlook: "Very High Growth",
        trendScore: 96,
        description: "Protects computers, networks and information from digital threats.",
        skills: ["Networking", "Security", "Problem Solving", "Risk Analysis"],
        education: "Cybersecurity, Computer Science or Information Technology.",
        roadmap: [
            "Learn computer fundamentals",
            "Study networking",
            "Learn cybersecurity concepts",
            "Study ethical security practices",
            "Earn relevant certifications",
            "Gain practical experience"
        ]
    },

    cloud_engineer: {
        title: "Cloud Engineer",
        field: "Technology & AI",
        icon: "☁️",
        outlook: "High Growth",
        trendScore: 92,
        description: "Designs and manages computing systems hosted through cloud platforms.",
        skills: ["Cloud Computing", "Networking", "Programming", "Systems"],
        education: "Computer Science, IT or Cloud Computing.",
        roadmap: [
            "Learn operating systems",
            "Study networking",
            "Learn cloud fundamentals",
            "Study cloud platforms",
            "Build cloud projects",
            "Gain certifications"
        ]
    },

    game_developer: {
        title: "Game Developer",
        field: "Technology & AI",
        icon: "🎮",
        outlook: "Growing",
        trendScore: 78,
        description: "Creates interactive games using programming, design and storytelling.",
        skills: ["Programming", "Game Engines", "Creativity", "Mathematics"],
        education: "Game Development, Computer Science or related field.",
        roadmap: [
            "Learn programming",
            "Learn a game engine",
            "Study game design",
            "Create small games",
            "Build a game portfolio",
            "Join game development projects"
        ]
    },

    robotics_engineer: {
        title: "Robotics Engineer",
        field: "Technology & AI",
        icon: "🦾",
        outlook: "High Growth",
        trendScore: 93,
        description: "Designs robots and automated systems used in industry, research and other fields.",
        skills: ["Engineering", "Programming", "Robotics", "Mathematics"],
        education: "Robotics, Mechanical Engineering, Electrical Engineering or Computer Science.",
        roadmap: [
            "Study mathematics and physics",
            "Learn programming",
            "Study electronics",
            "Learn robotics",
            "Build robotic projects",
            "Specialize in automation"
        ]
    },

    ux_designer: {
        title: "UX Designer",
        field: "Technology & AI",
        icon: "🎨",
        outlook: "Growing",
        trendScore: 82,
        description: "Designs digital experiences that are easy and enjoyable for people to use.",
        skills: ["Design", "Research", "Creativity", "Communication"],
        education: "UX Design, Interaction Design, Graphic Design or related field.",
        roadmap: [
            "Learn design principles",
            "Study user research",
            "Learn interface design",
            "Use design tools",
            "Build UX case studies",
            "Create a portfolio"
        ]
    },

    // ==============================
    // MEDICINE & HEALTH
    // ==============================

    doctor: {
        title: "Doctor",
        field: "Medicine & Health",
        icon: "🩺",
        outlook: "High Growth",
        trendScore: 90,
        description: "Diagnoses illnesses, treats patients and supports their health and wellbeing.",
        skills: ["Science", "Communication", "Decision Making", "Empathy"],
        education: "Medical degree followed by required clinical training and specialization.",
        roadmap: [
            "Build strong biology and chemistry foundations",
            "Complete medical entrance requirements",
            "Study medicine",
            "Complete clinical training",
            "Complete internship",
            "Choose a medical specialization"
        ]
    },

    surgeon: {
        title: "Surgeon",
        field: "Medicine & Health",
        icon: "🏥",
        outlook: "High Growth",
        trendScore: 89,
        description: "Performs surgical procedures to treat injuries and medical conditions.",
        skills: ["Medicine", "Precision", "Decision Making", "Teamwork"],
        education: "Medical degree followed by surgical specialization.",
        roadmap: [
            "Study medicine",
            "Complete clinical training",
            "Complete internship",
            "Enter surgical training",
            "Develop specialist skills",
            "Complete required licensing"
        ]
    },

    nurse: {
        title: "Registered Nurse",
        field: "Medicine & Health",
        icon: "👩‍⚕️",
        outlook: "High Growth",
        trendScore: 91,
        description: "Provides patient care, monitors health and supports doctors and healthcare teams.",
        skills: ["Biology", "Communication", "Care", "Teamwork"],
        education: "Nursing degree or approved nursing qualification.",
        roadmap: [
            "Study biology",
            "Complete nursing education",
            "Complete clinical training",
            "Meet licensing requirements",
            "Gain hospital experience",
            "Choose a nursing specialty"
        ]
    },

    psychologist: {
        title: "Psychologist",
        field: "Medicine & Health",
        icon: "🧠",
        outlook: "Growing",
        trendScore: 86,
        description: "Studies behaviour and helps people understand and manage psychological challenges.",
        skills: ["Psychology", "Communication", "Research", "Empathy"],
        education: "Psychology degree followed by advanced study depending on specialization.",
        roadmap: [
            "Study psychology",
            "Learn research methods",
            "Complete undergraduate education",
            "Complete advanced training",
            "Gain supervised experience",
            "Specialize in an area of psychology"
        ]
    },

    pharmacist: {
        title: "Pharmacist",
        field: "Medicine & Health",
        icon: "💊",
        outlook: "Stable",
        trendScore: 74,
        description: "Works with medicines and helps patients use them safely and effectively.",
        skills: ["Chemistry", "Biology", "Accuracy", "Communication"],
        education: "Pharmacy degree and required professional licensing.",
        roadmap: [
            "Study chemistry and biology",
            "Complete pharmacy degree",
            "Complete practical training",
            "Meet licensing requirements",
            "Gain professional experience",
            "Specialize if desired"
        ]
    },

    dentist: {
        title: "Dentist",
        field: "Medicine & Health",
        icon: "🦷",
        outlook: "Growing",
        trendScore: 80,
        description: "Diagnoses and treats conditions affecting teeth, gums and oral health.",
        skills: ["Biology", "Precision", "Communication", "Healthcare"],
        education: "Dental degree followed by required professional training.",
        roadmap: [
            "Study science subjects",
            "Enter dental school",
            "Complete clinical training",
            "Complete internship or required training",
            "Obtain professional registration",
            "Develop a dental specialization"
        ]
    },

    physiotherapist: {
        title: "Physiotherapist",
        field: "Medicine & Health",
        icon: "🏃",
        outlook: "Growing",
        trendScore: 84,
        description: "Helps people recover movement and physical function after illness or injury.",
        skills: ["Biology", "Exercise Science", "Communication", "Care"],
        education: "Physiotherapy degree or equivalent professional qualification.",
        roadmap: [
            "Study biology",
            "Study human anatomy",
            "Complete physiotherapy education",
            "Complete clinical placements",
            "Meet professional requirements",
            "Choose a specialization"
        ]
    },

    veterinarian: {
        title: "Veterinarian",
        field: "Medicine & Health",
        icon: "🐾",
        outlook: "Growing",
        trendScore: 77,
        description: "Diagnoses and treats diseases and injuries in animals.",
        skills: ["Biology", "Animal Science", "Problem Solving", "Care"],
        education: "Veterinary medicine degree.",
        roadmap: [
            "Study biology and chemistry",
            "Enter veterinary school",
            "Complete clinical training",
            "Complete required internship",
            "Obtain professional registration",
            "Choose an animal-care specialty"
        ]
    },

    nutritionist: {
        title: "Nutritionist",
        field: "Medicine & Health",
        icon: "🥗",
        outlook: "Growing",
        trendScore: 76,
        description: "Studies nutrition and helps people understand healthy food and lifestyle choices.",
        skills: ["Biology", "Nutrition", "Communication", "Research"],
        education: "Nutrition, Dietetics or related health-science education.",
        roadmap: [
            "Study biology",
            "Study nutrition",
            "Complete relevant degree",
            "Gain supervised experience",
            "Meet professional requirements",
            "Specialize in an area"
        ]
    },

    medical_researcher: {
        title: "Medical Researcher",
        field: "Medicine & Health",
        icon: "🔬",
        outlook: "Growing",
        trendScore: 87,
        description: "Conducts scientific research to understand diseases and improve healthcare.",
        skills: ["Biology", "Research", "Statistics", "Critical Thinking"],
        education: "Life sciences, biomedical science or related field.",
        roadmap: [
            "Study biology and chemistry",
            "Learn scientific research",
            "Complete a science degree",
            "Join research projects",
            "Complete advanced study if required",
            "Specialize in biomedical research"
        ]
    },

    // ==============================
    // ENGINEERING
    // ==============================

    mechanical_engineer: {
        title: "Mechanical Engineer",
        field: "Engineering",
        icon: "⚙️",
        outlook: "Growing",
        trendScore: 80,
        description: "Designs and develops machines, products and mechanical systems.",
        skills: ["Physics", "Mathematics", "CAD", "Problem Solving"],
        education: "Mechanical Engineering degree.",
        roadmap: [
            "Study mathematics and physics",
            "Study engineering",
            "Learn CAD",
            "Complete engineering projects",
            "Gain internship experience",
            "Specialize in an engineering area"
        ]
    },

    electrical_engineer: {
        title: "Electrical Engineer",
        field: "Engineering",
        icon: "⚡",
        outlook: "Growing",
        trendScore: 83,
        description: "Designs electrical systems, equipment and technologies.",
        skills: ["Physics", "Electronics", "Mathematics", "Problem Solving"],
        education: "Electrical or Electronics Engineering degree.",
        roadmap: [
            "Study physics and mathematics",
            "Learn electronics",
            "Study electrical engineering",
            "Build practical projects",
            "Complete internships",
            "Specialize in an electrical field"
        ]
    },

    civil_engineer: {
        title: "Civil Engineer",
        field: "Engineering",
        icon: "🏗️",
        outlook: "Stable Growth",
        trendScore: 75,
        description: "Designs and develops infrastructure such as buildings, roads and bridges.",
        skills: ["Mathematics", "Physics", "Design", "Project Management"],
        education: "Civil Engineering degree.",
        roadmap: [
            "Study mathematics and physics",
            "Study civil engineering",
            "Learn engineering software",
            "Complete design projects",
            "Gain field experience",
            "Specialize in infrastructure"
        ]
    },

    aerospace_engineer: {
        title: "Aerospace Engineer",
        field: "Engineering",
        icon: "🚀",
        outlook: "Growing",
        trendScore: 84,
        description: "Designs aircraft, spacecraft and aerospace systems.",
        skills: ["Physics", "Mathematics", "Engineering", "Programming"],
        education: "Aerospace or Mechanical Engineering degree.",
        roadmap: [
            "Study mathematics and physics",
            "Learn engineering principles",
            "Study aerospace systems",
            "Build technical projects",
            "Complete internships",
            "Specialize in aerospace systems"
        ]
    },

    chemical_engineer: {
        title: "Chemical Engineer",
        field: "Engineering",
        icon: "🧪",
        outlook: "Stable Growth",
        trendScore: 72,
        description: "Uses chemistry, physics and engineering to develop industrial processes.",
        skills: ["Chemistry", "Mathematics", "Engineering", "Research"],
        education: "Chemical Engineering degree.",
        roadmap: [
            "Study chemistry and mathematics",
            "Study chemical engineering",
            "Learn process design",
            "Complete laboratory projects",
            "Gain industrial experience",
            "Specialize in an industry"
        ]
    },

    environmental_engineer: {
        title: "Environmental Engineer",
        field: "Engineering",
        icon: "🌱",
        outlook: "Very High Growth",
        trendScore: 94,
        description: "Develops engineering solutions for environmental challenges.",
        skills: ["Science", "Engineering", "Research", "Problem Solving"],
        education: "Environmental or Civil Engineering degree.",
        roadmap: [
            "Study science",
            "Study engineering",
            "Learn environmental systems",
            "Complete sustainability projects",
            "Gain practical experience",
            "Specialize in environmental engineering"
        ]
    },

    renewable_energy_engineer: {
        title: "Renewable Energy Engineer",
        field: "Engineering",
        icon: "☀️",
        outlook: "Very High Growth",
        trendScore: 96,
        description: "Develops technologies that produce energy from renewable sources.",
        skills: ["Physics", "Engineering", "Energy Systems", "Mathematics"],
        education: "Engineering degree with energy specialization.",
        roadmap: [
            "Study physics and mathematics",
            "Study energy systems",
            "Learn renewable technologies",
            "Build energy projects",
            "Gain industry experience",
            "Specialize in solar, wind or other systems"
        ]
    },

    biomedical_engineer: {
        title: "Biomedical Engineer",
        field: "Engineering",
        icon: "🦿",
        outlook: "Growing",
        trendScore: 89,
        description: "Combines engineering and biology to create healthcare technologies.",
        skills: ["Biology", "Engineering", "Programming", "Research"],
        education: "Biomedical Engineering or related degree.",
        roadmap: [
            "Study biology and physics",
            "Learn engineering",
            "Study biomedical systems",
            "Build healthcare technology projects",
            "Gain research experience",
            "Specialize in biomedical technology"
        ]
    },

    // ==============================
    // BUSINESS & FINANCE
    // ==============================

    entrepreneur: {
        title: "Entrepreneur",
        field: "Business & Finance",
        icon: "🚀",
        outlook: "Flexible",
        trendScore: 84,
        description: "Creates and develops businesses, products or services.",
        skills: ["Leadership", "Creativity", "Finance", "Communication"],
        education: "Business, entrepreneurship or relevant experience.",
        roadmap: [
            "Learn business fundamentals",
            "Develop an idea",
            "Research customers",
            "Create a business plan",
            "Build and test a product",
            "Grow the business"
        ]
    },

    business_analyst: {
        title: "Business Analyst",
        field: "Business & Finance",
        icon: "📊",
        outlook: "Growing",
        trendScore: 85,
        description: "Studies business processes and data to help organizations make better decisions.",
        skills: ["Analysis", "Communication", "Data", "Problem Solving"],
        education: "Business, Economics, Finance or related degree.",
        roadmap: [
            "Study business fundamentals",
            "Learn data analysis",
            "Develop communication skills",
            "Learn business intelligence tools",
            "Complete projects",
            "Gain industry experience"
        ]
    },

    financial_analyst: {
        title: "Financial Analyst",
        field: "Business & Finance",
        icon: "💹",
        outlook: "Growing",
        trendScore: 79,
        description: "Evaluates financial information to support investment and business decisions.",
        skills: ["Mathematics", "Finance", "Analysis", "Excel"],
        education: "Finance, Economics, Accounting or related degree.",
        roadmap: [
            "Study mathematics",
            "Learn accounting",
            "Study finance",
            "Learn financial modelling",
            "Complete internships",
            "Specialize in financial analysis"
        ]
    },

    accountant: {
        title: "Accountant",
        field: "Business & Finance",
        icon: "🧾",
        outlook: "Stable",
        trendScore: 68,
        description: "Manages financial records, reports and accounting information.",
        skills: ["Mathematics", "Accounting", "Accuracy", "Organization"],
        education: "Accounting or Finance degree and relevant professional qualifications.",
        roadmap: [
            "Study mathematics",
            "Learn accounting",
            "Complete an accounting degree",
            "Gain practical experience",
            "Complete professional qualifications",
            "Specialize if desired"
        ]
    },

    economist: {
        title: "Economist",
        field: "Business & Finance",
        icon: "📚",
        outlook: "Growing",
        trendScore: 73,
        description: "Studies economic activity and develops models to understand markets and policies.",
        skills: ["Economics", "Mathematics", "Statistics", "Research"],
        education: "Economics degree; advanced study is common.",
        roadmap: [
            "Study economics",
            "Learn mathematics",
            "Study statistics",
            "Conduct economic research",
            "Complete advanced study if required",
            "Specialize in an economic field"
        ]
    },

    marketing_manager: {
        title: "Marketing Manager",
        field: "Business & Finance",
        icon: "📣",
        outlook: "Growing",
        trendScore: 81,
        description: "Plans and manages strategies that help organizations reach customers.",
        skills: ["Communication", "Creativity", "Strategy", "Data Analysis"],
        education: "Marketing, Business or Communications degree.",
        roadmap: [
            "Study marketing",
            "Learn consumer behaviour",
            "Learn digital marketing",
            "Build campaign projects",
            "Gain internship experience",
            "Move into marketing management"
        ]
    },

    project_manager: {
        title: "Project Manager",
        field: "Business & Finance",
        icon: "📋",
        outlook: "Growing",
        trendScore: 82,
        description: "Plans and coordinates projects to help teams achieve specific goals.",
        skills: ["Leadership", "Organization", "Communication", "Planning"],
        education: "Business, Management or related field.",
        roadmap: [
            "Learn project planning",
            "Develop communication skills",
            "Lead small projects",
            "Learn project management tools",
            "Gain professional experience",
            "Pursue project management qualifications"
        ]
    },

    // ==============================
    // LAW & GOVERNMENT
    // ==============================

    lawyer: {
        title: "Lawyer",
        field: "Law & Government",
        icon: "⚖️",
        outlook: "Stable",
        trendScore: 70,
        description: "Provides legal advice and represents clients in legal matters.",
        skills: ["Research", "Writing", "Communication", "Critical Thinking"],
        education: "Law degree followed by required professional training.",
        roadmap: [
            "Develop reading and writing skills",
            "Study law",
            "Complete legal training",
            "Gain supervised experience",
            "Meet professional requirements",
            "Choose a legal specialization"
        ]
    },

    judge: {
        title: "Judge",
        field: "Law & Government",
        icon: "🏛️",
        outlook: "Specialized",
        trendScore: 64,
        description: "Interprets and applies the law while overseeing legal proceedings.",
        skills: ["Law", "Reasoning", "Decision Making", "Communication"],
        education: "Law education followed by extensive legal experience and required appointment processes.",
        roadmap: [
            "Study law",
            "Become a qualified legal professional",
            "Gain substantial legal experience",
            "Develop judicial expertise",
            "Meet appointment requirements",
            "Serve in the judiciary"
        ]
    },

    diplomat: {
        title: "Diplomat",
        field: "Law & Government",
        icon: "🌍",
        outlook: "Specialized",
        trendScore: 71,
        description: "Represents a country and works on international relations and cooperation.",
        skills: ["Languages", "Communication", "Negotiation", "International Relations"],
        education: "International Relations, Political Science, Law or related field.",
        roadmap: [
            "Study international affairs",
            "Learn foreign languages",
            "Develop communication skills",
            "Study diplomacy",
            "Gain international experience",
            "Apply through relevant diplomatic pathways"
        ]
    },

    political_scientist: {
        title: "Political Scientist",
        field: "Law & Government",
        icon: "🏛️",
        outlook: "Growing",
        trendScore: 70,
        description: "Researches political systems, governments and public policy.",
        skills: ["Research", "Writing", "Analysis", "Communication"],
        education: "Political Science or related degree.",
        roadmap: [
            "Study political science",
            "Learn research methods",
            "Conduct political research",
            "Complete advanced study if required",
            "Publish research",
            "Work in research or policy"
        ]
    },

    // ==============================
    // SCIENCE
    // ==============================

    biologist: {
        title: "Biologist",
        field: "Science",
        icon: "🧬",
        outlook: "Growing",
        trendScore: 78,
        description: "Studies living organisms and biological systems.",
        skills: ["Biology", "Research", "Observation", "Statistics"],
        education: "Biology or Life Sciences degree.",
        roadmap: [
            "Study biology",
            "Learn laboratory techniques",
            "Complete a science degree",
            "Join research projects",
            "Complete advanced study if needed",
            "Specialize in biology"
        ]
    },

    physicist: {
        title: "Physicist",
        field: "Science",
        icon: "⚛️",
        outlook: "Specialized",
        trendScore: 75,
        description: "Studies matter, energy, forces and the fundamental laws of nature.",
        skills: ["Physics", "Mathematics", "Research", "Problem Solving"],
        education: "Physics degree; research careers commonly require advanced study.",
        roadmap: [
            "Study mathematics and physics",
            "Complete a physics degree",
            "Participate in research",
            "Learn computational methods",
            "Complete advanced study if needed",
            "Specialize in physics"
        ]
    },

    chemist: {
        title: "Chemist",
        field: "Science",
        icon: "🧪",
        outlook: "Stable Growth",
        trendScore: 72,
        description: "Studies substances and chemical processes in laboratories and industry.",
        skills: ["Chemistry", "Research", "Laboratory Skills", "Analysis"],
        education: "Chemistry or related science degree.",
        roadmap: [
            "Study chemistry",
            "Develop laboratory skills",
            "Complete a chemistry degree",
            "Participate in research",
            "Gain laboratory experience",
            "Specialize in a chemistry field"
        ]
    },

    astronomer: {
        title: "Astronomer",
        field: "Science",
        icon: "🔭",
        outlook: "Specialized",
        trendScore: 76,
        description: "Studies stars, planets, galaxies and other objects in space.",
        skills: ["Physics", "Mathematics", "Programming", "Research"],
        education: "Physics, Astronomy or related degree; research roles often require advanced study.",
        roadmap: [
            "Study physics and mathematics",
            "Learn astronomy",
            "Learn programming",
            "Participate in research",
            "Complete advanced study",
            "Conduct astronomical research"
        ]
    },

    marine_biologist: {
        title: "Marine Biologist",
        field: "Science",
        icon: "🌊",
        outlook: "Growing",
        trendScore: 79,
        description: "Studies marine organisms and ecosystems.",
        skills: ["Biology", "Ocean Science", "Research", "Fieldwork"],
        education: "Marine Biology, Biology or Environmental Science.",
        roadmap: [
            "Study biology",
            "Learn marine science",
            "Complete fieldwork",
            "Study marine ecosystems",
            "Join research projects",
            "Specialize in marine biology"
        ]
    },

    geologist: {
        title: "Geologist",
        field: "Science",
        icon: "🌋",
        outlook: "Stable Growth",
        trendScore: 69,
        description: "Studies Earth, rocks, minerals and geological processes.",
        skills: ["Earth Science", "Research", "Fieldwork", "Analysis"],
        education: "Geology or Earth Science degree.",
        roadmap: [
            "Study Earth science",
            "Learn geology",
            "Complete fieldwork",
            "Develop laboratory skills",
            "Gain industry or research experience",
            "Specialize in geology"
        ]
    },

    climate_scientist: {
        title: "Climate Scientist",
        field: "Science",
        icon: "🌎",
        outlook: "High Growth",
        trendScore: 91,
        description: "Studies Earth's climate and develops knowledge about climate systems and change.",
        skills: ["Climate Science", "Mathematics", "Data Analysis", "Research"],
        education: "Climate Science, Environmental Science, Physics or related field.",
        roadmap: [
            "Study science and mathematics",
            "Learn climate systems",
            "Learn data analysis",
            "Conduct climate research",
            "Complete advanced study if required",
            "Work in climate research or policy"
        ]
    },

    // ==============================
    // EDUCATION
    // ==============================

    teacher: {
        title: "Teacher",
        field: "Education",
        icon: "👩‍🏫",
        outlook: "High Demand",
        trendScore: 86,
        description: "Helps students learn knowledge, skills and ways of thinking.",
        skills: ["Communication", "Patience", "Subject Knowledge", "Leadership"],
        education: "Education degree or approved teacher-training pathway.",
        roadmap: [
            "Choose a subject area",
            "Complete relevant degree",
            "Complete teacher training",
            "Gain classroom experience",
            "Meet licensing requirements",
            "Continue professional development"
        ]
    },

    university_professor: {
        title: "University Professor",
        field: "Education",
        icon: "🎓",
        outlook: "Specialized",
        trendScore: 72,
        description: "Teaches university students and often conducts academic research.",
        skills: ["Research", "Teaching", "Communication", "Subject Expertise"],
        education: "Advanced degree in a specialized academic field.",
        roadmap: [
            "Choose an academic subject",
            "Complete undergraduate study",
            "Complete postgraduate study",
            "Conduct research",
            "Publish academic work",
            "Apply for academic positions"
        ]
    },

    school_counsellor: {
        title: "School Counsellor",
        field: "Education",
        icon: "🧑‍💼",
        outlook: "Growing",
        trendScore: 82,
        description: "Supports students with educational, personal and career-related development.",
        skills: ["Communication", "Psychology", "Empathy", "Problem Solving"],
        education: "Counselling, Psychology or Education with appropriate professional training.",
        roadmap: [
            "Study psychology or education",
            "Learn counselling skills",
            "Complete relevant qualification",
            "Gain supervised experience",
            "Meet professional requirements",
            "Work in an educational setting"
        ]
    },

    // ==============================
    // MEDIA & CREATIVE
    // ==============================

    filmmaker: {
        title: "Film Director",
        field: "Media & Creative Arts",
        icon: "🎬",
        outlook: "Competitive",
        trendScore: 78,
        description: "Leads the creative and visual direction of films and video productions.",
        skills: ["Storytelling", "Leadership", "Visual Design", "Communication"],
        education: "Film, Media, Visual Arts or practical filmmaking experience.",
        roadmap: [
            "Study storytelling",
            "Learn filmmaking basics",
            "Create short films",
            "Learn directing and cinematography",
            "Build a showreel",
            "Work on professional productions"
        ]
    },

    photographer: {
        title: "Photographer",
        field: "Media & Creative Arts",
        icon: "📷",
        outlook: "Competitive",
        trendScore: 70,
        description: "Creates photographs for artistic, commercial, documentary or editorial purposes.",
        skills: ["Photography", "Creativity", "Editing", "Visual Storytelling"],
        education: "Photography, Visual Arts or practical portfolio development.",
        roadmap: [
            "Learn photography",
            "Practice composition",
            "Learn photo editing",
            "Build a portfolio",
            "Choose a photography specialty",
            "Work with clients or organizations"
        ]
    },

    journalist: {
        title: "Journalist",
        field: "Media & Creative Arts",
        icon: "📰",
        outlook: "Changing",
        trendScore: 65,
        description: "Researches and communicates news and information to the public.",
        skills: ["Writing", "Research", "Communication", "Critical Thinking"],
        education: "Journalism, Communications or related field.",
        roadmap: [
            "Develop writing skills",
            "Study journalism",
            "Learn interviewing",
            "Create published work",
            "Gain newsroom or media experience",
            "Specialize in a reporting area"
        ]
    },

    writer: {
        title: "Writer / Author",
        field: "Media & Creative Arts",
        icon: "✍️",
        outlook: "Flexible",
        trendScore: 74,
        description: "Creates written content such as books, stories, articles and scripts.",
        skills: ["Writing", "Creativity", "Research", "Communication"],
        education: "Writing, Literature, Journalism or practical writing experience.",
        roadmap: [
            "Write regularly",
            "Read widely",
            "Study storytelling",
            "Build a writing portfolio",
            "Submit or publish work",
            "Develop a writing specialty"
        ]
    },

    graphic_designer: {
        title: "Graphic Designer",
        field: "Media & Creative Arts",
        icon: "🎨",
        outlook: "Changing",
        trendScore: 63,
        description: "Creates visual designs for brands, publications, products and digital media.",
        skills: ["Design", "Typography", "Creativity", "Visual Communication"],
        education: "Graphic Design, Visual Arts or relevant portfolio.",
        roadmap: [
            "Learn design principles",
            "Learn design software",
            "Create design projects",
            "Build a portfolio",
            "Work on real briefs",
            "Develop a design specialty"
        ]
    },

    // ==============================
    // DESIGN & ARCHITECTURE
    // ==============================

    architect: {
        title: "Architect",
        field: "Design & Architecture",
        icon: "🏛️",
        outlook: "Stable Growth",
        trendScore: 74,
        description: "Designs buildings and spaces while balancing function, safety and aesthetics.",
        skills: ["Design", "Mathematics", "Creativity", "Technical Drawing"],
        education: "Architecture degree and required professional training.",
        roadmap: [
            "Study mathematics and design",
            "Learn technical drawing",
            "Study architecture",
            "Build a design portfolio",
            "Complete practical training",
            "Meet professional registration requirements"
        ]
    },

    interior_designer: {
        title: "Interior Designer",
        field: "Design & Architecture",
        icon: "🛋️",
        outlook: "Growing",
        trendScore: 73,
        description: "Designs functional and visually appealing interior spaces.",
        skills: ["Design", "Creativity", "Spatial Planning", "Communication"],
        education: "Interior Design, Architecture or related field.",
        roadmap: [
            "Study design",
            "Learn spatial planning",
            "Learn design software",
            "Create interior projects",
            "Build a portfolio",
            "Work with clients"
        ]
    },

    fashion_designer: {
        title: "Fashion Designer",
        field: "Design & Architecture",
        icon: "👗",
        outlook: "Competitive",
        trendScore: 69,
        description: "Creates clothing, accessories and fashion collections.",
        skills: ["Design", "Creativity", "Textiles", "Trend Research"],
        education: "Fashion Design or relevant practical training.",
        roadmap: [
            "Study fashion design",
            "Learn textiles",
            "Learn garment construction",
            "Create collections",
            "Build a portfolio",
            "Gain industry experience"
        ]
    },

    product_designer: {
        title: "Product Designer",
        field: "Design & Architecture",
        icon: "📦",
        outlook: "Growing",
        trendScore: 83,
        description: "Designs physical or digital products around user needs and business goals.",
        skills: ["Design", "Research", "Creativity", "Problem Solving"],
        education: "Product Design, Industrial Design, UX or related field.",
        roadmap: [
            "Learn design principles",
            "Study user needs",
            "Learn prototyping",
            "Create product projects",
            "Build case studies",
            "Develop a professional portfolio"
        ]
    },

    // ==============================
    // AVIATION & TRAVEL
    // ==============================

    pilot: {
        title: "Commercial Pilot",
        field: "Aviation & Travel",
        icon: "✈️",
        outlook: "Growing",
        trendScore: 85,
        description: "Flies aircraft and is responsible for safe and efficient flight operations.",
        skills: ["Mathematics", "Physics", "Communication", "Decision Making"],
        education: "Approved pilot training and required aviation licenses.",
        roadmap: [
            "Study mathematics and physics",
            "Meet aviation medical requirements",
            "Complete flight training",
            "Earn required pilot licenses",
            "Build flight experience",
            "Meet airline requirements"
        ]
    },

    air_traffic_controller: {
        title: "Air Traffic Controller",
        field: "Aviation & Travel",
        icon: "🛫",
        outlook: "Specialized",
        trendScore: 74,
        description: "Coordinates aircraft movement to help maintain safe and organized air traffic.",
        skills: ["Concentration", "Communication", "Decision Making", "Spatial Awareness"],
        education: "Approved air traffic control training and certification.",
        roadmap: [
            "Meet entry requirements",
            "Complete specialized training",
            "Study aviation procedures",
            "Complete practical simulation",
            "Pass required assessments",
            "Begin professional service"
        ]
    },

    aviation_engineer: {
        title: "Aviation Engineer",
        field: "Aviation & Travel",
        icon: "🛩️",
        outlook: "Growing",
        trendScore: 81,
        description: "Maintains, designs or improves aircraft systems and aviation technology.",
        skills: ["Engineering", "Physics", "Mathematics", "Technical Skills"],
        education: "Aerospace, Aviation or Mechanical Engineering.",
        roadmap: [
            "Study mathematics and physics",
            "Study engineering",
            "Learn aircraft systems",
            "Complete technical projects",
            "Gain aviation experience",
            "Specialize in aircraft systems"
        ]
    },

    travel_consultant: {
        title: "Travel Consultant",
        field: "Aviation & Travel",
        icon: "🧳",
        outlook: "Changing",
        trendScore: 67,
        description: "Helps people plan trips, transportation and travel experiences.",
        skills: ["Communication", "Organization", "Geography", "Customer Service"],
        education: "Travel, Tourism, Hospitality or relevant experience.",
        roadmap: [
            "Learn geography",
            "Study tourism",
            "Learn travel planning",
            "Develop customer service skills",
            "Gain industry experience",
            "Specialize in a travel market"
        ]
    },

    // ==============================
    // ENVIRONMENT
    // ==============================

    environmental_scientist: {
        title: "Environmental Scientist",
        field: "Environment & Sustainability",
        icon: "🌿",
        outlook: "High Growth",
        trendScore: 91,
        description: "Studies environmental problems and develops solutions for protecting natural systems.",
        skills: ["Science", "Research", "Data Analysis", "Fieldwork"],
        education: "Environmental Science, Biology, Chemistry or related degree.",
        roadmap: [
            "Study science",
            "Learn environmental systems",
            "Complete environmental projects",
            "Gain field experience",
            "Conduct environmental research",
            "Specialize in sustainability"
        ]
    },

    sustainability_specialist: {
        title: "Sustainability Specialist",
        field: "Environment & Sustainability",
        icon: "♻️",
        outlook: "Very High Growth",
        trendScore: 93,
        description: "Helps organizations reduce environmental impact and improve sustainability.",
        skills: ["Sustainability", "Research", "Data", "Communication"],
        education: "Environmental Science, Sustainability, Engineering, Business or related field.",
        roadmap: [
            "Study sustainability",
            "Learn environmental systems",
            "Understand business operations",
            "Complete sustainability projects",
            "Gain practical experience",
            "Specialize in sustainable development"
        ]
    },

    renewable_energy_technician: {
        title: "Renewable Energy Technician",
        field: "Environment & Sustainability",
        icon: "🔋",
        outlook: "Very High Growth",
        trendScore: 95,
        description: "Installs, maintains and supports renewable energy systems.",
        skills: ["Technical Skills", "Electrical Systems", "Problem Solving", "Safety"],
        education: "Technical training in renewable energy, electrical systems or related field.",
        roadmap: [
            "Learn electrical fundamentals",
            "Study renewable energy",
            "Complete technical training",
            "Practice installation and maintenance",
            "Gain field experience",
            "Specialize in renewable systems"
        ]
    },

    conservation_scientist: {
        title: "Conservation Scientist",
        field: "Environment & Sustainability",
        icon: "🌳",
        outlook: "Growing",
        trendScore: 82,
        description: "Works to protect forests, ecosystems, wildlife and natural resources.",
        skills: ["Biology", "Environmental Science", "Fieldwork", "Research"],
        education: "Environmental Science, Biology, Forestry or related field.",
        roadmap: [
            "Study biology",
            "Learn ecology",
            "Study conservation",
            "Complete fieldwork",
            "Join conservation projects",
            "Specialize in ecosystem management"
        ]
    },

    // ==============================
    // SPORTS
    // ==============================

    professional_athlete: {
        title: "Professional Athlete",
        field: "Sports",
        icon: "🏆",
        outlook: "Highly Competitive",
        trendScore: 66,
        description: "Competes professionally in an organized sport.",
        skills: ["Discipline", "Fitness", "Teamwork", "Mental Focus"],
        education: "Sport-specific training and development.",
        roadmap: [
            "Choose a sport",
            "Train consistently",
            "Join structured competitions",
            "Work with qualified coaches",
            "Build competitive experience",
            "Pursue professional opportunities"
        ]
    },

    sports_coach: {
        title: "Sports Coach",
        field: "Sports",
        icon: "🏅",
        outlook: "Growing",
        trendScore: 77,
        description: "Trains athletes and teams to improve performance and skills.",
        skills: ["Leadership", "Communication", "Sports Knowledge", "Planning"],
        education: "Sports Science, Coaching or relevant certification.",
        roadmap: [
            "Develop sports expertise",
            "Learn coaching principles",
            "Gain coaching experience",
            "Complete relevant certifications",
            "Work with teams",
            "Specialize in a sport"
        ]
    },

    sports_scientist: {
        title: "Sports Scientist",
        field: "Sports",
        icon: "🔬",
        outlook: "Growing",
        trendScore: 79,
        description: "Uses science and data to understand and improve athletic performance.",
        skills: ["Biology", "Exercise Science", "Data", "Research"],
        education: "Sports Science, Exercise Physiology or related degree.",
        roadmap: [
            "Study biology",
            "Learn exercise science",
            "Study human performance",
            "Learn data analysis",
            "Conduct sports research",
            "Work with athletes or teams"
        ]
    },

    // ==============================
    // SOCIAL SCIENCE
    // ==============================

    sociologist: {
        title: "Sociologist",
        field: "Social Sciences",
        icon: "👥",
        outlook: "Growing",
        trendScore: 72,
        description: "Studies society, social behaviour and relationships between groups.",
        skills: ["Research", "Statistics", "Communication", "Critical Thinking"],
        education: "Sociology or related social science degree.",
        roadmap: [
            "Study sociology",
            "Learn research methods",
            "Study statistics",
            "Conduct social research",
            "Complete advanced study if required",
            "Work in research or policy"
        ]
    },

    anthropologist: {
        title: "Anthropologist",
        field: "Social Sciences",
        icon: "🌍",
        outlook: "Specialized",
        trendScore: 68,
        description: "Studies human cultures, societies and development.",
        skills: ["Research", "Observation", "Writing", "Cultural Awareness"],
        education: "Anthropology or related social science degree.",
        roadmap: [
            "Study anthropology",
            "Learn research methods",
            "Conduct fieldwork",
            "Study cultures and societies",
            "Complete advanced research if needed",
            "Specialize in an area"
        ]
    },

    historian: {
        title: "Historian",
        field: "Social Sciences",
        icon: "📜",
        outlook: "Specialized",
        trendScore: 64,
        description: "Researches and interprets events and developments from the past.",
        skills: ["Research", "Writing", "Analysis", "Critical Thinking"],
        education: "History or related degree.",
        roadmap: [
            "Study history",
            "Develop research skills",
            "Learn archival methods",
            "Conduct historical research",
            "Publish or present findings",
            "Specialize in a historical period"
        ]
    },

    // ==============================
    // COMMUNICATION
    // ==============================

    public_relations_specialist: {
        title: "Public Relations Specialist",
        field: "Communication",
        icon: "📢",
        outlook: "Growing",
        trendScore: 76,
        description: "Manages communication and public image for organizations or individuals.",
        skills: ["Communication", "Writing", "Media", "Strategy"],
        education: "Communications, Public Relations, Marketing or related field.",
        roadmap: [
            "Develop communication skills",
            "Study public relations",
            "Learn media relations",
            "Create communication campaigns",
            "Gain internship experience",
            "Work in PR"
        ]
    },

    content_creator: {
        title: "Content Creator",
        field: "Communication",
        icon: "📱",
        outlook: "Growing",
        trendScore: 80,
        description: "Creates digital content for audiences across online platforms.",
        skills: ["Creativity", "Communication", "Video", "Writing"],
        education: "No single required degree; media, communication or creative training can help.",
        roadmap: [
            "Choose a content area",
            "Learn content production",
            "Practice consistently",
            "Build an audience",
            "Create a portfolio",
            "Develop professional partnerships"
        ]
    },

    social_media_manager: {
        title: "Social Media Manager",
        field: "Communication",
        icon: "📲",
        outlook: "Growing",
        trendScore: 83,
        description: "Plans and manages social media communication for organizations and brands.",
        skills: ["Communication", "Marketing", "Creativity", "Analytics"],
        education: "Marketing, Communications, Media or related field.",
        roadmap: [
            "Learn social media platforms",
            "Study digital marketing",
            "Learn analytics",
            "Create sample campaigns",
            "Build a portfolio",
            "Gain professional experience"
        ]
    },

    // ==============================
    // HOSPITALITY
    // ==============================

    hotel_manager: {
        title: "Hotel Manager",
        field: "Hospitality",
        icon: "🏨",
        outlook: "Growing",
        trendScore: 74,
        description: "Manages hotel operations, staff and guest experiences.",
        skills: ["Leadership", "Communication", "Organization", "Customer Service"],
        education: "Hospitality, Hotel Management, Business or related field.",
        roadmap: [
            "Study hospitality",
            "Learn hotel operations",
            "Gain customer service experience",
            "Develop management skills",
            "Work in hotel operations",
            "Progress into management"
        ]
    },

    chef: {
        title: "Chef",
        field: "Hospitality",
        icon: "👨‍🍳",
        outlook: "Growing",
        trendScore: 75,
        description: "Creates food and manages kitchen operations.",
        skills: ["Cooking", "Creativity", "Organization", "Teamwork"],
        education: "Culinary training and practical kitchen experience.",
        roadmap: [
            "Learn cooking fundamentals",
            "Complete culinary training",
            "Gain kitchen experience",
            "Develop a specialty",
            "Lead kitchen teams",
            "Develop a professional reputation"
        ]
    },

    event_manager: {
        title: "Event Manager",
        field: "Hospitality",
        icon: "🎪",
        outlook: "Growing",
        trendScore: 77,
        description: "Plans and coordinates events, conferences and experiences.",
        skills: ["Planning", "Communication", "Creativity", "Organization"],
        education: "Event Management, Hospitality, Business or related experience.",
        roadmap: [
            "Learn event planning",
            "Organize small events",
            "Develop supplier and budgeting skills",
            "Build event experience",
            "Gain professional experience",
            "Manage larger events"
        ]
    },

    // ==============================
    // AGRICULTURE
    // ==============================

    agricultural_scientist: {
        title: "Agricultural Scientist",
        field: "Agriculture",
        icon: "🌾",
        outlook: "Growing",
        trendScore: 81,
        description: "Uses science to improve crops, farming systems and food production.",
        skills: ["Biology", "Research", "Agriculture", "Data"],
        education: "Agricultural Science, Biology or related field.",
        roadmap: [
            "Study biology",
            "Learn agricultural science",
            "Complete research projects",
            "Study sustainable farming",
            "Gain field experience",
            "Specialize in agricultural research"
        ]
    },

    agronomist: {
        title: "Agronomist",
        field: "Agriculture",
        icon: "🌱",
        outlook: "Growing",
        trendScore: 80,
        description: "Helps improve crop production, soil management and sustainable agriculture.",
        skills: ["Agriculture", "Biology", "Soil Science", "Research"],
        education: "Agronomy, Agricultural Science or related degree.",
        roadmap: [
            "Study biology",
            "Learn soil and crop science",
            "Complete agricultural education",
            "Gain field experience",
            "Work with farms or organizations",
            "Specialize in crop systems"
        ]
    },

    // ==============================
    // MATH & STATISTICS
    // ==============================

    mathematician: {
        title: "Mathematician",
        field: "Mathematics & Statistics",
        icon: "➗",
        outlook: "Growing",
        trendScore: 78,
        description: "Develops mathematical theories and uses mathematics to solve complex problems.",
        skills: ["Mathematics", "Logic", "Research", "Problem Solving"],
        education: "Mathematics degree; research roles often require advanced study.",
        roadmap: [
            "Build advanced mathematics skills",
            "Study pure or applied mathematics",
            "Complete research projects",
            "Develop computational skills",
            "Complete advanced study if required",
            "Specialize in mathematics"
        ]
    },

    statistician: {
        title: "Statistician",
        field: "Mathematics & Statistics",
        icon: "📐",
        outlook: "High Growth",
        trendScore: 87,
        description: "Uses statistical methods to understand data and support decisions.",
        skills: ["Statistics", "Mathematics", "Data Analysis", "Programming"],
        education: "Statistics, Mathematics, Data Science or related field.",
        roadmap: [
            "Study mathematics",
            "Learn statistics",
            "Learn statistical software",
            "Study data analysis",
            "Complete practical projects",
            "Work in a specialized industry"
        ]
    },

    // ==============================
    // MORE TECHNOLOGY
    // ==============================

    database_administrator: {
        title: "Database Administrator",
        field: "Technology & AI",
        icon: "🗄️",
        outlook: "Stable Growth",
        trendScore: 73,
        description: "Manages databases and helps keep organizational data reliable and accessible.",
        skills: ["Databases", "SQL", "Security", "Problem Solving"],
        education: "Computer Science, IT or database-related training.",
        roadmap: [
            "Learn database fundamentals",
            "Learn SQL",
            "Study database security",
            "Practice database administration",
            "Gain practical experience",
            "Specialize in database systems"
        ]
    },

    network_engineer: {
        title: "Network Engineer",
        field: "Technology & AI",
        icon: "🌐",
        outlook: "Growing",
        trendScore: 79,
        description: "Designs and maintains computer networks and communication systems.",
        skills: ["Networking", "Systems", "Security", "Problem Solving"],
        education: "Computer Networking, IT or Computer Science.",
        roadmap: [
            "Learn networking fundamentals",
            "Study network systems",
            "Learn network security",
            "Complete practical labs",
            "Gain certifications",
            "Work in network engineering"
        ]
    },

    systems_analyst: {
        title: "Systems Analyst",
        field: "Technology & AI",
        icon: "🖥️",
        outlook: "Growing",
        trendScore: 80,
        description: "Studies organizational technology systems and recommends improvements.",
        skills: ["Analysis", "Technology", "Communication", "Problem Solving"],
        education: "Computer Science, IT, Business or related field.",
        roadmap: [
            "Learn computer systems",
            "Study business processes",
            "Learn systems analysis",
            "Complete technology projects",
            "Gain organizational experience",
            "Specialize in systems analysis"
        ]
    },

    // ==============================
    // ADDITIONAL CAREERS
    // ==============================

    forensic_scientist: {
        title: "Forensic Scientist",
        field: "Science",
        icon: "🔬",
        outlook: "Growing",
        trendScore: 76,
        description: "Uses scientific methods to analyze evidence for investigations.",
        skills: ["Chemistry", "Biology", "Analysis", "Attention to Detail"],
        education: "Forensic Science, Chemistry, Biology or related degree.",
        roadmap: [
            "Study chemistry and biology",
            "Learn laboratory methods",
            "Study forensic science",
            "Complete practical training",
            "Gain laboratory experience",
            "Specialize in forensic analysis"
        ]
    },

    archaeologist: {
        title: "Archaeologist",
        field: "Social Sciences",
        icon: "🏺",
        outlook: "Specialized",
        trendScore: 65,
        description: "Studies human history through archaeological sites and material evidence.",
        skills: ["Research", "History", "Fieldwork", "Analysis"],
        education: "Archaeology, Anthropology, History or related degree.",
        roadmap: [
            "Study history",
            "Learn archaeology",
            "Develop fieldwork skills",
            "Participate in excavations",
            "Conduct research",
            "Specialize in archaeology"
        ]
    },

    urban_planner: {
        title: "Urban Planner",
        field: "Design & Architecture",
        icon: "🏙️",
        outlook: "Growing",
        trendScore: 82,
        description: "Plans how cities and communities develop and use space.",
        skills: ["Planning", "Geography", "Design", "Analysis"],
        education: "Urban Planning, Geography, Architecture or related field.",
        roadmap: [
            "Study geography",
            "Learn urban systems",
            "Study planning",
            "Learn mapping and planning tools",
            "Complete planning projects",
            "Gain professional experience"
        ]
    },

    occupational_therapist: {
        title: "Occupational Therapist",
        field: "Medicine & Health",
        icon: "🧑‍⚕️",
        outlook: "High Growth",
        trendScore: 88,
        description: "Helps people develop or regain skills needed for everyday activities.",
        skills: ["Healthcare", "Communication", "Problem Solving", "Empathy"],
        education: "Occupational Therapy degree and professional requirements.",
        roadmap: [
            "Study biology",
            "Learn human development",
            "Complete occupational therapy education",
            "Complete clinical training",
            "Meet professional requirements",
            "Specialize in a patient group"
        ]
    },

    speech_therapist: {
        title: "Speech-Language Therapist",
        field: "Medicine & Health",
        icon: "🗣️",
        outlook: "High Growth",
        trendScore: 86,
        description: "Helps people with communication and swallowing difficulties.",
        skills: ["Communication", "Biology", "Psychology", "Empathy"],
        education: "Speech-Language Pathology or related professional degree.",
        roadmap: [
            "Study biology and language",
            "Study communication development",
            "Complete professional education",
            "Complete clinical training",
            "Meet licensing requirements",
            "Specialize in speech therapy"
        ]
    },

    urban_ecologist: {
        title: "Urban Ecologist",
        field: "Environment & Sustainability",
        icon: "🏙️",
        outlook: "Growing",
        trendScore: 80,
        description: "Studies ecosystems within cities and helps improve urban environmental health.",
        skills: ["Ecology", "Research", "Environmental Science", "Data"],
        education: "Ecology, Environmental Science, Biology or related field.",
        roadmap: [
            "Study biology",
            "Learn ecology",
            "Study urban environments",
            "Conduct field research",
            "Work on sustainability projects",
            "Specialize in urban ecology"
        ]
    },

    science_communicator: {
        title: "Science Communicator",
        field: "Media & Creative Arts",
        icon: "🔬",
        outlook: "Growing",
        trendScore: 79,
        description: "Explains scientific ideas to the public through media, education and communication.",
        skills: ["Science", "Writing", "Communication", "Creativity"],
        education: "Science, Journalism, Communications or related field.",
        roadmap: [
            "Build strong science knowledge",
            "Develop writing skills",
            "Learn communication",
            "Create science content",
            "Build a portfolio",
            "Work with media or science organizations"
        ]
    },

    educational_technology_specialist: {
        title: "Educational Technology Specialist",
        field: "Education",
        icon: "💡",
        outlook: "High Growth",
        trendScore: 89,
        description: "Uses technology to improve teaching, learning and educational experiences.",
        skills: ["Education", "Technology", "Design", "Communication"],
        education: "Education, Educational Technology, Computer Science or related field.",
        roadmap: [
            "Study education or technology",
            "Learn digital learning tools",
            "Study instructional design",
            "Create educational technology projects",
            "Gain school or technology experience",
            "Specialize in learning technology"
        ]
    },

    ai_ethics_specialist: {
        title: "AI Ethics Specialist",
        field: "Technology & AI",
        icon: "⚖️",
        outlook: "Emerging",
        trendScore: 95,
        description: "Helps organizations understand and manage ethical questions surrounding artificial intelligence.",
        skills: ["AI", "Ethics", "Research", "Critical Thinking"],
        education: "Computer Science, Philosophy, Law, Policy or related field.",
        roadmap: [
            "Learn AI fundamentals",
            "Study ethics",
            "Understand technology policy",
            "Study responsible AI",
            "Research real-world AI issues",
            "Work in responsible technology"
        ]
    },

    quantum_computing_researcher: {
        title: "Quantum Computing Researcher",
        field: "Technology & AI",
        icon: "⚛️",
        outlook: "Emerging",
        trendScore: 92,
        description: "Researches computing systems based on quantum mechanical principles.",
        skills: ["Physics", "Mathematics", "Programming", "Research"],
        education: "Physics, Mathematics, Computer Science or related advanced study.",
        roadmap: [
            "Build strong mathematics",
            "Study physics",
            "Learn programming",
            "Study quantum computing",
            "Conduct research",
            "Specialize in quantum technologies"
        ]
    },

    space_scientist: {
        title: "Space Scientist",
        field: "Science",
        icon: "🪐",
        outlook: "Emerging",
        trendScore: 88,
        description: "Researches space, planetary systems and technologies used to explore the universe.",
        skills: ["Physics", "Mathematics", "Research", "Programming"],
        education: "Physics, Astronomy, Space Science or Engineering.",
        roadmap: [
            "Study mathematics and physics",
            "Learn astronomy or space science",
            "Develop programming skills",
            "Participate in research",
            "Complete advanced study if needed",
            "Work in space research"
        ]
    }

};


// ========================================
// CAREER EXPLORER FUNCTIONS
// ========================================

function loadCareerExplorer() {

    const explorerPage =
        document.getElementById("explorerPage");

    if (!explorerPage) return;


    // ----------------------------------------
    // BUILD EXPLORER UI
    // ----------------------------------------

    explorerPage.innerHTML = `

        <div class="portal-page-header">

            <span class="section-label">
                EXPLORE YOUR FUTURE
            </span>

            <h2>
                Career Explorer 🔎
            </h2>

            <p>
                Explore careers across technology, medicine,
                science, business, design and many more fields.
            </p>

        </div>


        <div class="career-explorer-controls">

            <div class="career-search-box">

                <span>🔎</span>

                <input
                    type="text"
                    id="careerExplorerSearch"
                    placeholder="Search any career..."
                    autocomplete="off"
                >

            </div>


            <select id="careerExplorerCategory">

                <option value="">
                    All Fields
                </option>

                ${[
                    ...new Set(
                        Object.values(careerExplorerDatabase)
                            .map(career => career.field)
                    )
                ].sort().map(field => `
                    <option value="${field}">
                        ${field}
                    </option>
                `).join("")}

            </select>

        </div>


        <!-- CAREER SPOTLIGHT -->

        <section class="featured-career-section">

            <div
                id="featuredCareerCard"
                class="featured-career-card"
            >
            </div>

        </section>


        <div class="section-header">

            <div>

                <span class="section-label">
                    CAREER LIBRARY
                </span>

                <h2>
                    Explore Careers
                </h2>

            </div>

            <span
                id="careerExplorerCount"
                class="career-result-count"
            >
                0 careers
            </span>

        </div>


        <div
            id="careerExplorerGrid"
            class="career-explorer-grid"
        >
        </div>

    `;


    const searchInput =
        document.getElementById("careerExplorerSearch");

    const categorySelect =
        document.getElementById("careerExplorerCategory");

    const explorerGrid =
        document.getElementById("careerExplorerGrid");

    const careerCount =
        document.getElementById("careerExplorerCount");


    const careers =
    Object.entries(careerExplorerDatabase);

console.log("CAREER DATABASE:", careerExplorerDatabase);
console.log("CAREER COUNT:", careers.length);

    // ========================================
    // DAILY CAREER SPOTLIGHT
    // ========================================

    function loadDailySpotlight() {

        const spotlight =
            document.getElementById("featuredCareerCard");

        if (!spotlight) return;


        /*
         * Changes every day.
         *
         * Higher trend scores have a greater chance
         * of appearing in the spotlight.
         */

        const date =
            new Date();

        const dayNumber =
            Math.floor(
                date.getTime() /
                (1000 * 60 * 60 * 24)
            );


        const sortedCareers =
            careers
                .filter(
                    ([, career]) =>
                        career.trendScore >= 85
                )
                .sort(
                    ([, a], [, b]) =>
                        b.trendScore - a.trendScore
                );


        const selectedIndex =
            dayNumber %
            sortedCareers.length;


        const [category, career] =
            sortedCareers[selectedIndex];


        spotlight.innerHTML = `

            <div class="featured-career-icon">
                ${career.icon}
            </div>

            <div class="featured-career-content">

                <span class="section-label">
                    ✨ CAREER SPOTLIGHT
                </span>

                <h3>
                    ${career.title}
                </h3>

                <p>
                    ${career.description}
                </p>

                <div style="
                    margin-top:12px;
                    font-size:11px;
                    font-weight:700;
                    opacity:0.85;
                ">
                    📈 ${career.outlook}
                </div>

            </div>

            <div class="featured-career-action">

                <button
                    type="button"
                    class="primary-btn career-details-btn"
                    data-career="${category}"
                >
                    Explore Career →
                </button>

            </div>

        `;

    }


    // ========================================
    // CREATE CAREER CARD
    // ========================================

    function createCareerCard(category, career) {

        const saved =
            (
                JSON.parse(
                    localStorage.getItem(
                        "naventraSavedCareers"
                    )
                ) || []
            ).includes(category);


        return `

            <article class="career-explorer-card">

                <div class="career-explorer-card-top">

                    <div class="career-explorer-icon">
                        ${career.icon}
                    </div>

                    <span class="career-field">
                        ${career.field}
                    </span>

                </div>


                <h3>
                    ${career.title}
                </h3>


                <p>
                    ${career.description}
                </p>


                <div style="
                    margin-bottom:16px;
                    font-size:11px;
                    font-weight:700;
                    color:#667085;
                ">
                    📈 ${career.outlook}
                </div>


                <div class="career-explorer-actions">

                    <button
                        type="button"
                        class="career-details-btn"
                        data-career="${category}"
                    >
                        View Details
                    </button>


                    <button
                        type="button"
                        class="career-roadmap-btn"
                        data-career="${category}"
                    >
                        🗺️ Roadmap
                    </button>


                    <button
                        type="button"
                        class="career-save-btn ${saved ? "saved" : ""}"
                        data-career="${category}"
                    >
                        ${saved ? "💜 Saved" : "💜 Save"}
                    </button>

                </div>

            </article>

        `;

    }


    // ========================================
    // DISPLAY CAREERS
    // ========================================

    function displayCareers() {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        const selectedField =
            categorySelect.value
                .trim()
                .toLowerCase();


        const filtered =
            careers.filter(
                ([category, career]) => {

                    const searchableText = `

                        ${category}
                        ${career.title}
                        ${career.field}
                        ${career.description}
                        ${career.skills.join(" ")}

                    `.toLowerCase();


                    const matchesSearch =
                        !searchTerm ||
                        searchableText.includes(searchTerm);


                    const matchesField =
                        !selectedField ||
                        career.field.toLowerCase()
                            === selectedField;


                    return (
                        matchesSearch &&
                        matchesField
                    );

                }
            );


        careerCount.textContent =
            `${filtered.length} ${
                filtered.length === 1
                    ? "career"
                    : "careers"
            }`;


        if (filtered.length === 0) {

            explorerGrid.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No careers found
                    </h3>

                    <p>
                        Try another career name,
                        skill or field.
                    </p>

                </div>

            `;

            return;
        }


        explorerGrid.innerHTML =
            filtered
                .map(
                    ([category, career]) =>
                        createCareerCard(
                            category,
                            career
                        )
                )
                .join("");

    }


    // ========================================
    // SEARCH
    // ========================================

    searchInput.addEventListener(
        "input",
        displayCareers
    );


    categorySelect.addEventListener(
        "change",
        displayCareers
    );


    // ========================================
    // INITIAL LOAD
    // ========================================

    loadDailySpotlight();

    displayCareers();


    // ========================================
    // CAREER DETAILS / ROADMAP MODAL
    // ========================================

    function createCareerModal() {

        if (
            document.getElementById(
                "careerExplorerModal"
            )
        ) {
            return;
        }


        document.body.insertAdjacentHTML(
            "beforeend",

            `

            <div
                class="career-details-modal"
                id="careerExplorerModal"
            >

                <div class="career-details-content">

                    <button
                        type="button"
                        class="career-details-close"
                        id="careerExplorerModalClose"
                    >
                        ×
                    </button>

                    <div
                        id="careerExplorerModalBody"
                    >
                    </div>

                </div>

            </div>

            `
        );

    }


    createCareerModal();


    const modal =
        document.getElementById(
            "careerExplorerModal"
        );

    const modalBody =
        document.getElementById(
            "careerExplorerModalBody"
        );


    // ========================================
    // OPEN CAREER DETAILS
    // ========================================

    function openCareerDetails(category) {

        const career =
            careerExplorerDatabase[category];

        if (!career) return;


        modalBody.innerHTML = `

            <div class="career-details-icon">
                ${career.icon}
            </div>

            <span class="career-details-field">
                ${career.field}
            </span>

            <h2>
                ${career.title}
            </h2>

            <p>
                ${career.description}
            </p>


            <div style="
                margin-top:18px;
                padding:14px;
                border-radius:12px;
                background:#f7f9fc;
            ">

                <strong>
                    📈 Career Outlook
                </strong>

                <p style="margin:6px 0 0;">
                    ${career.outlook}
                </p>

            </div>


            <h3 style="margin-top:25px;">
                🧠 Important Skills
            </h3>

            <p>
                ${career.skills.join(" • ")}
            </p>


            <h3 style="margin-top:25px;">
                🎓 Education
            </h3>

            <p>
                ${career.education}
            </p>


            <h3 style="margin-top:25px;">
                🗺️ Career Roadmap
            </h3>

            <div class="claim-process">

                ${career.roadmap.map(
                    (step, index) => `

                    <div class="claim-step">

                        <div class="claim-step-icon">
                            ${index + 1}
                        </div>

                        <span>
                            ${step}
                        </span>

                    </div>

                    `
                ).join("")}

            </div>


            <div class="career-details-actions">

                <button
                    type="button"
                    class="primary-btn career-save-btn"
                    data-career="${category}"
                >
                    💜 Save Career
                </button>

            </div>

        `;


        modal.classList.add("active");

    }


    // ========================================
    // BUTTON EVENTS
    // ========================================

    document.addEventListener(
        "click",
        (event) => {

            const detailsButton =
                event.target.closest(
                    ".career-details-btn"
                );


            if (detailsButton) {

                const category =
                    detailsButton.dataset.career;

                if (category) {
                    openCareerDetails(category);
                }

                return;

            }


            const roadmapButton =
                event.target.closest(
                    ".career-roadmap-btn"
                );


            if (roadmapButton) {

    const category =
        roadmapButton.dataset.career;

    if (category) {
        openCareerDetails(category);
    }

}

const saveButton =
    event.target.closest(".career-save-btn");

if (saveButton) {

    const category =
        saveButton.dataset.career;

    if (!category) return;

    const career =
        careerExplorerDatabase[category];

    if (!career) return;

    saveCareerToSupabase(category, career);
}
        }
    );


    // ========================================
    // CLOSE MODAL
    // ========================================

    const closeButton =
        document.getElementById(
            "careerExplorerModalClose"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.classList.remove(
                    "active"
                );

            }
        );

    }


    modal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "active"
                );

            }

        }
    );


    // ========================================
    // ESCAPE
    // ========================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                modal.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ========================================
// START CAREER EXPLORER
// ========================================

if (
    document.getElementById(
        "explorerPage"
    )
) 
    loadCareerExplorer();
}

// ========================================
// ACHIEVEMENT VAULT
// ========================================

const achievementList =
    document.getElementById("achievementList");

const addAchievementBtn =
    document.getElementById("addAchievementBtn");

const totalAchievements =
    document.getElementById("totalAchievements");

const awardCount =
    document.getElementById("awardCount");

const certificateCount =
    document.getElementById("certificateCount");

const badgeCount =
    document.getElementById("badgeCount");


// ========================================
// LOAD ACHIEVEMENTS
// ========================================

async function loadAchievements() {

    if (!achievementList) return;

    achievementList.innerHTML = `
        <div class="empty-state">
            Loading your achievements...
        </div>
    `;


    // Get logged-in student
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "Could not get logged-in user:",
            userError
        );

        achievementList.innerHTML = `
            <div class="empty-state">
                Please log in to view your achievements.
            </div>
        `;

        return;
    }


    // Get student's achievements
    const {
        data: achievements,
        error
    } = await supabaseClient
        .from("achievements")
        .select("*")
        .eq("student_id", user.id)
        .order("achievement_date", {
            ascending: false
        });


    if (error) {

        console.error(
            "Could not load achievements:",
            error
        );

        achievementList.innerHTML = `
            <div class="empty-state">
                <h3>Could not load achievements</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;

        return;
    }


    // Update summary
    updateAchievementSummary(achievements || []);


    // No achievements
    if (!achievements || achievements.length === 0) {

        achievementList.innerHTML = `
            <div class="empty-state">
                <div style="font-size:42px;">🏆</div>

                <h3>No achievements yet</h3>

                <p>
                    Your awards, certificates, badges
                    and medals will appear here.
                </p>

                <button
                    type="button"
                    class="primary-btn"
                    id="emptyAddAchievementBtn"
                >
                    + Add Your First Achievement
                </button>
            </div>
        `;

        const emptyAddBtn =
            document.getElementById(
                "emptyAddAchievementBtn"
            );

        if (emptyAddBtn) {
            emptyAddBtn.addEventListener(
                "click",
                openAchievementForm
            );
        }

        return;
    }


    // Display achievement cards
    achievementList.innerHTML =
    `<div class="empty-state">
        Loading achievement cards...
    </div>`;

const achievementCards = [];

for (const achievement of achievements) {

    const card =
        await createAchievementCard(
            achievement
        );

    achievementCards.push(card);
}

achievementList.innerHTML =
    achievementCards.join("");
}


// ========================================
// UPDATE SUMMARY
// ========================================

function updateAchievementSummary(achievements) {

    if (totalAchievements) {
        totalAchievements.textContent =
            achievements.length;
    }


    if (awardCount) {

        awardCount.textContent =
            achievements.filter(
                achievement =>
                    achievement.category?.toLowerCase()
                    === "award"
            ).length;

    }


    if (certificateCount) {

        certificateCount.textContent =
            achievements.filter(
                achievement =>
                    achievement.category?.toLowerCase()
                    === "certificate"
            ).length;

    }


    if (badgeCount) {

        badgeCount.textContent =
            achievements.filter(
                achievement => {

                    const category =
                        achievement.category?.toLowerCase();

                    return (
                        category === "badge" ||
                        category === "medal"
                    );

                }
            ).length;

    }

}


// ========================================
// CREATE ACHIEVEMENT CARD
// ========================================

async function createAchievementCard(achievement) {

    const category =
        achievement.category || "Other";


    const categoryLower =
        category.toLowerCase();


    // Choose icon
    let icon = "🏆";

    if (categoryLower === "certificate") {
        icon = "📜";
    }
    else if (categoryLower === "award") {
        icon = "🥇";
    }
    else if (categoryLower === "badge") {
        icon = "🏅";
    }
    else if (categoryLower === "medal") {
        icon = "🎖️";
    }


    // Format date
    const achievementDate =
        achievement.achievement_date ||
        achievement.date;


    const formattedDate =
        achievementDate
            ? new Date(
                achievementDate
            ).toLocaleDateString(
                undefined,
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            )
            : "Date not provided";


    // ========================================
    // CREATE SIGNED IMAGE URL
    // ========================================

    let imageUrl = null;

    if (achievement.image_url) {

        const imagePath =
            getStoragePath(
                achievement.image_url,
                "achievement-images"
            );

        if (imagePath) {

            const {
                data: imageData,
                error: imageError
            } = await supabaseClient
                .storage
                .from("achievement-images")
                .createSignedUrl(
                    imagePath,
                    3600
                );

            if (imageError) {

                console.error(
                    "Could not create image URL:",
                    imageError
                );

            } else {

                imageUrl =
                    imageData?.signedUrl || null;

            }

        }

    }


    // ========================================
    // CREATE SIGNED FILE URL
    // ========================================

    let fileUrl = null;

    if (achievement.file_url) {

        const filePath =
            getStoragePath(
                achievement.file_url,
                "achievement-files"
            );

        if (filePath) {

            const {
                data: fileData,
                error: fileError
            } = await supabaseClient
                .storage
                .from("achievement-files")
                .createSignedUrl(
                    filePath,
                    3600
                );

            if (fileError) {

                console.error(
                    "Could not create certificate URL:",
                    fileError
                );

            } else {

                fileUrl =
                    fileData?.signedUrl || null;

            }

        }

    }


    // ========================================
    // VERIFICATION
    // ========================================

    const verificationStatus =
        achievement.verification_status ||
        "pending";


    const isVerified =
        verificationStatus.toLowerCase()
        === "verified";


    // ========================================
    // IMAGE HTML
    // ========================================

    const imageHTML =
        imageUrl
            ? `
                <div class="achievement-image-wrapper">

                    <img
                        src="${imageUrl}"
                        alt="${achievement.title || "Achievement"}"
                        class="achievement-image"
                    >

                </div>
            `
            : "";


    // ========================================
    // CERTIFICATE BUTTON
    // ========================================

    const fileHTML =
        fileUrl
            ? `
                <a
                    href="${fileUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="achievement-file-btn"
                >
                    📄 View Certificate
                </a>
            `
            : "";


    // ========================================
    // RETURN CARD
    // ========================================

    return `

        <article
            class="achievement-card"
            data-achievement-id="${achievement.id}"
        >

            ${imageHTML}


            <div class="achievement-card-icon">
                ${icon}
            </div>


            <div class="achievement-card-content">

                <span class="achievement-category">
                    ${category}
                </span>


                <h3>
                    ${achievement.title || "Untitled Achievement"}
                </h3>


                ${
                    achievement.issuing_organization
                    ? `
                        <p class="achievement-organization">
                            🏫 ${achievement.issuing_organization}
                        </p>
                    `
                    : ""
                }


                ${
                    achievementDate
                    ? `
                        <p class="achievement-date">
                            📅 ${formattedDate}
                        </p>
                    `
                    : ""
                }


                ${
                    achievement.description
                    ? `
                        <p class="achievement-description">
                            ${achievement.description}
                        </p>
                    `
                    : ""
                }


                <div class="achievement-card-actions">

                    ${fileHTML}


                    <button
                        type="button"
                        class="achievement-view-btn"
                        data-achievement-id="${achievement.id}"
                    >
                        View Details
                    </button>

                </div>


                <div class="achievement-card-footer">

                    <span class="achievement-status ${
                        isVerified
                            ? "verified"
                            : "pending"
                    }">

                        ${
                            isVerified
                                ? "✓ Verified"
                                : "◷ Pending Verification"
                        }

                    </span>

                </div>

            </div>

        </article>

    `;
}


// ========================================
// GET STORAGE PATH
// ========================================

function getStoragePath(
    url,
    bucketName
) {

    if (!url) return null;


    // If the stored value is already
    // a storage path, use it directly.
    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {
        return url;
    }


    // Extract path from Supabase URL
    const marker =
        `/storage/v1/object/`;


    const markerIndex =
        url.indexOf(marker);


    if (markerIndex === -1) {
        return null;
    }


    let path =
        url.substring(
            markerIndex + marker.length
        );


    // Remove "public/" or "sign/" etc.
    path =
        path.replace(
            /^(public|sign|authenticated)\//,
            ""
        );


    // Remove bucket name
    if (
        path.startsWith(
            `${bucketName}/`
        )
    ) {

        path =
            path.substring(
                bucketName.length + 1
            );

    }


    // Remove query parameters
    path =
        path.split("?")[0];


    return decodeURIComponent(path);
}
// ========================================
// ACHIEVEMENT FORM
// ========================================

function openAchievementForm() {

    if (
        document.getElementById(
            "achievementModal"
        )
    ) {
        return;
    }


    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="achievement-modal"
            id="achievementModal"
        >

            <div class="achievement-modal-content">

                <button
                    type="button"
                    class="achievement-modal-close"
                    id="achievementModalClose"
                >
                    ×
                </button>


                <span class="section-label">
                    ADD TO YOUR VAULT
                </span>

                <h2>
                    Add Achievement 🏆
                </h2>

                <p>
                    Add an award, certificate, badge,
                    medal or other accomplishment.
                </p>


                <form id="achievementForm">

                    <div class="achievement-form-group">

                        <label>
                            Achievement Title
                        </label>

                        <input
                            type="text"
                            id="achievementTitle"
                            placeholder="e.g. Mathematics Exhibition – 3rd Prize"
                            required
                        >

                    </div>


                    <div class="achievement-form-row">

                        <div class="achievement-form-group">

                            <label>
                                Category
                            </label>

                            <select
                                id="achievementCategory"
                                required
                            >

                                <option value="">
                                    Select category
                                </option>

                                <option value="Award">
                                    Award
                                </option>

                                <option value="Certificate">
                                    Certificate
                                </option>

                                <option value="Badge">
                                    Badge
                                </option>

                                <option value="Medal">
                                    Medal
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        <div class="achievement-form-group">

                            <label>
                                Achievement Date
                            </label>

                            <input
                                type="date"
                                id="achievementDate"
                                required
                            >

                        </div>

                    </div>


                    <div class="achievement-form-group">

                        <label>
                            Issuing Organization
                        </label>

                        <input
                            type="text"
                            id="achievementOrganization"
                            placeholder="e.g. School, competition, organization"
                        >

                    </div>


                    <div class="achievement-form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            id="achievementDescription"
                            rows="4"
                            placeholder="Tell us a little about this achievement..."
                        ></textarea>

                    </div>
            <div class="achievement-form-group">

    <label>
        Achievement Image
    </label>

    <input
        type="file"
        id="achievementImage"
        accept="image/*"
    >

    <small>
        Upload a photo of your trophy, medal, badge or certificate.
    </small>

</div>


<div class="achievement-form-group">

    <label>
        Certificate / Document
    </label>

    <input
        type="file"
        id="achievementFile"
        accept=".pdf,.doc,.docx,image/*"
    >

    <small>
        Upload the certificate or supporting document.
    </small>

</div>


                    <button
                        type="submit"
                        class="primary-btn"
                        id="saveAchievementBtn"
                    >
                        Save Achievement
                    </button>

                </form>

            </div>

        </div>

        `
    );


    const modal =
        document.getElementById(
            "achievementModal"
        );

    const closeBtn =
        document.getElementById(
            "achievementModalClose"
        );

    const form =
        document.getElementById(
            "achievementForm"
        );


    closeBtn.addEventListener(
        "click",
        () => {
            modal.remove();
        }
    );


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                modal.remove();
            }

        }
    );


    form.addEventListener(
        "submit",
        saveAchievement
    );

}


// ========================================
// SAVE ACHIEVEMENT
// ========================================

async function saveAchievement(event) {

    event.preventDefault();


    const saveButton =
        document.getElementById(
            "saveAchievementBtn"
        );


    saveButton.disabled = true;
    saveButton.textContent =
        "Saving...";


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        alert(
            "Please log in before adding an achievement."
        );

        saveButton.disabled = false;
        saveButton.textContent =
            "Save Achievement";

        return;
    }


    // ========================================
// GET FILES
// ========================================

const imageInput =
    document.getElementById("achievementImage");

const fileInput =
    document.getElementById("achievementFile");

const imageFile =
    imageInput?.files?.[0];

const certificateFile =
    fileInput?.files?.[0];


// ========================================
// GET FORM DATA
// ========================================

const title =
    document.getElementById(
        "achievementTitle"
    ).value.trim();

const category =
    document.getElementById(
        "achievementCategory"
    ).value;

const achievementDate =
    document.getElementById(
        "achievementDate"
    ).value;

const organization =
    document.getElementById(
        "achievementOrganization"
    ).value.trim();

const description =
    document.getElementById(
        "achievementDescription"
    ).value.trim();


// ========================================
// FILE URLS
// ========================================

let imageUrl = null;
let fileUrl = null;


// ========================================
// UPLOAD IMAGE
// ========================================

if (imageFile) {

    const imageExtension =
        imageFile.name
            .split(".")
            .pop()
            .toLowerCase();

    const imagePath =
        `${user.id}/${crypto.randomUUID()}.${imageExtension}`;


    const {
        error: imageUploadError
    } = await supabaseClient
        .storage
        .from("achievement-images")
        .upload(
            imagePath,
            imageFile,
            {
                cacheControl: "3600",
                upsert: false
            }
        );


    if (imageUploadError) {

        console.error(
            "Could not upload achievement image:",
            imageUploadError
        );

        alert(
            "The achievement image could not be uploaded."
        );

        saveButton.disabled = false;
        saveButton.textContent =
            "Save Achievement";

        return;
    }


    const {
        data: imageUrlData
    } = supabaseClient
        .storage
        .from("achievement-images")
        .getPublicUrl(imagePath);


    imageUrl =
        imageUrlData?.publicUrl || null;

}


// ========================================
// UPLOAD CERTIFICATE / DOCUMENT
// ========================================

if (certificateFile) {

    const fileExtension =
        certificateFile.name
            .split(".")
            .pop()
            .toLowerCase();

    const filePath =
        `${user.id}/${crypto.randomUUID()}.${fileExtension}`;


    const {
        error: fileUploadError
    } = await supabaseClient
        .storage
        .from("achievement-files")
        .upload(
            filePath,
            certificateFile,
            {
                cacheControl: "3600",
                upsert: false
            }
        );


    if (fileUploadError) {

        console.error(
            "Could not upload achievement file:",
            fileUploadError
        );

        alert(
            "The certificate or document could not be uploaded."
        );

        saveButton.disabled = false;
        saveButton.textContent =
            "Save Achievement";

        return;
    }


    const {
        data: fileUrlData
    } = supabaseClient
        .storage
        .from("achievement-files")
        .getPublicUrl(filePath);


    fileUrl =
        fileUrlData?.publicUrl || null;

}


// ========================================
// CREATE ACHIEVEMENT DATA
// ========================================

const achievementData = {

    student_id: user.id,

    title: title,

    category: category,

    achievement_date: achievementDate,

    issuing_organization: organization,

    description: description,

    image_url: imageUrl,

    file_url: fileUrl,

    verification_status: "pending"

};

    const {
        data,
        error
    } = await supabaseClient
        .from("achievements")
        .insert([achievementData])
        .select()
        .single();


    if (error) {

        console.error(
            "Could not save achievement:",
            error
        );

        alert(
            "The achievement could not be saved. Please try again."
        );

        saveButton.disabled = false;
        saveButton.textContent =
            "Save Achievement";

        return;
    }


    console.log(
        "Achievement saved successfully:",
        data
    );


    const modal =
        document.getElementById(
            "achievementModal"
        );

    if (modal) {
        modal.remove();
    }


    await loadAchievements();

}


// ========================================
// ADD BUTTON
// ========================================

if (addAchievementBtn) {

    addAchievementBtn.addEventListener(
        "click",
        openAchievementForm
    );

}


// ========================================
// ACHIEVEMENT DETAILS
// ========================================

document.addEventListener(
    "click",
    event => {

        const viewButton =
            event.target.closest(
                ".achievement-view-btn"
            );

        if (!viewButton) return;


        const achievementId =
            viewButton.dataset.achievementId;


        if (!achievementId) return;


        showAchievementDetails(
            achievementId
        );

    }
);


// ========================================
// SHOW DETAILS
// ========================================

async function showAchievementDetails(
    achievementId
) {

    const {
        data: achievement,
        error
    } = await supabaseClient
        .from("achievements")
        .select("*")
        .eq("id", achievementId)
        .single();


    if (error || !achievement) {

        console.error(
            "Could not load achievement:",
            error
        );

        return;
    }


    const modal =
        document.getElementById(
            "achievementDetailsModal"
        );


    if (modal) {
        modal.remove();
    }


    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="achievement-modal"
            id="achievementDetailsModal"
        >

            <div class="achievement-modal-content">

                <button
                    type="button"
                    class="achievement-modal-close"
                    id="achievementDetailsClose"
                >
                    ×
                </button>


                <div class="achievement-details-icon">
                    🏆
                </div>


                <span class="achievement-category">
                    ${achievement.category || "Achievement"}
                </span>


                <h2>
                    ${achievement.title}
                </h2>


                ${
                    achievement.issuing_organization
                    ? `
                        <p>
                            🏫 ${achievement.issuing_organization}
                        </p>
                    `
                    : ""
                }


                ${
                    achievement.achievement_date
                    ? `
                        <p>
                            📅 ${
                                new Date(
                                    achievement.achievement_date
                                ).toLocaleDateString()
                            }
                        </p>
                    `
                    : ""
                }


                ${
                    achievement.description
                    ? `
                        <div class="achievement-details-description">
                            ${achievement.description}
                        </div>
                    `
                    : ""
                }


                <div class="achievement-verification-box">

                    ${
                        achievement.verification_status ===
                        "verified"
                        ? "✓ Verified Achievement"
                        : "◷ Pending Verification"
                    }

                </div>

            </div>

        </div>

        `
    );


    const closeButton =
        document.getElementById(
            "achievementDetailsClose"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "achievementDetailsModal"
                    )
                    ?.remove();

            }
        );

    }

}


// ========================================
// START ACHIEVEMENT VAULT
// ========================================

if (achievementList) {

    loadAchievements();

}
// ========================================
// SCHOOL EVENTS
// ========================================

const eventList =
    document.getElementById("eventList");

const eventSearchInput =
    document.getElementById("eventSearchInput");

const eventCategoryFilter =
    document.getElementById("eventCategoryFilter");

const eventsEmptyState =
    document.getElementById("eventsEmptyState");

let schoolEvents = [];


// ========================================
// LOAD EVENTS
// ========================================

async function loadSchoolEvents() {

    if (!eventList) return;

    eventList.innerHTML = `
        <div class="empty-state">
            Loading school events...
        </div>
    `;


    const {
        data: events,
        error
    } = await supabaseClient
        .from("events")
        .select("*")
        .eq("status", "published")
        .order(
            "event_date",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Could not load school events:",
            error
        );

        eventList.innerHTML = `
            <div class="empty-state">
                Could not load school events.
            </div>
        `;

        return;
    }


    schoolEvents = events || [];

    renderSchoolEvents();
}


// ========================================
// RENDER EVENTS
// ========================================

async function renderSchoolEvents() {

    if (!eventList) return;


    const searchTerm =
        eventSearchInput?.value
            .trim()
            .toLowerCase() || "";


    const selectedCategory =
        eventCategoryFilter?.value || "all";


    // ========================================
    // GET LOGGED-IN USER
    // ========================================

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    // ========================================
    // GET STUDENT REGISTRATIONS
    // ========================================

    let registeredEventIds =
        new Set();


    if (user) {

        const {
            data: registrations,
            error: registrationError
        } = await supabaseClient
            .from("event_registration")
            .select("event_id, status")
            .eq("student_id", user.id)
            .eq("status", "registered");


        if (registrationError) {

            console.error(
                "Could not load event registrations:",
                registrationError
            );

        } else {

            registeredEventIds =
                new Set(
                    (registrations || [])
                        .map(
                            registration =>
                                registration.event_id
                        )
                );

        }

    }


    // ========================================
    // FILTER EVENTS
    // ========================================

    const filteredEvents =
        schoolEvents.filter(event => {

            const matchesSearch =
                !searchTerm ||
                event.title
                    ?.toLowerCase()
                    .includes(searchTerm) ||
                event.description
                    ?.toLowerCase()
                    .includes(searchTerm) ||
                event.location
                    ?.toLowerCase()
                    .includes(searchTerm);


            const matchesCategory =
                selectedCategory === "all" ||
                event.category
                    ?.toLowerCase()
                    === selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    // ========================================
    // EMPTY STATE
    // ========================================

    if (eventsEmptyState) {

        eventsEmptyState.style.display =
            filteredEvents.length
                ? "none"
                : "block";

    }


    if (!filteredEvents.length) {

        eventList.innerHTML = "";

        return;
    }


    // ========================================
    // DISPLAY EVENTS
    // ========================================

    eventList.innerHTML =
        filteredEvents
            .map(
                event =>
                    createEventCard(
                        event,
                        registeredEventIds
                    )
            )
            .join("");


    attachEventRegistrationButtons();

}

// ========================================
// CREATE EVENT CARD
// ========================================

function createEventCard(event, registeredEventIds = new Set()) {

    const category =
        event.category || "Other";

    const categoryLabel =
        category.charAt(0).toUpperCase() +
        category.slice(1);


    // ========================================
    // DATE
    // ========================================

    let formattedDate =
        "Date to be announced";

    if (event.event_date) {

        formattedDate =
            new Date(
                event.event_date
            ).toLocaleDateString(
                undefined,
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

    }


    // ========================================
    // TIME
    // ========================================

    let timeText = "";

    if (event.start_time) {

        timeText =
            formatEventTime(
                event.start_time
            );

    }

    if (event.end_time) {

        timeText +=
            ` – ${formatEventTime(
                event.end_time
            )}`;

    }


    // ========================================
    // IMAGE
    // ========================================

    const imageHTML =
        event.image_url
            ? `
                <div class="event-image-wrapper">

                    <img
                        src="${event.image_url}"
                        alt="${event.title || "School event"}"
                        class="event-image"
                    >

                </div>
            `
            : `
                <div class="event-image-wrapper event-image-placeholder">

                    <span>
                        📅
                    </span>

                </div>
            `;


    // ========================================
    // REGISTRATION
    // ========================================

    let registrationHTML = "";

    if (event.registration_required) {

        const isRegistered =
            registeredEventIds.has(event.id);


        if (isRegistered) {

            registrationHTML = `
                <div class="event-registration-actions">

                    <button
                        type="button"
                        class="event-register-btn"
                        disabled
                    >
                        ✓ Registered
                    </button>

                    <button
                        type="button"
                        class="event-cancel-btn"
                        data-event-id="${event.id}"
                    >
                        Cancel Registration
                    </button>

                </div>
            `;

        } else {

            registrationHTML = `
                <button
                    type="button"
                    class="primary-btn event-register-btn"
                    data-event-id="${event.id}"
                >
                    Register
                </button>
            `;

        }

    } else {

        registrationHTML = `
            <span class="event-no-registration">
                Open Event
            </span>
        `;

    }


    // ========================================
    // EVENT CARD
    // ========================================

    return `

        <article
            class="event-card"
            data-event-id="${event.id}"
        >

            ${imageHTML}


            <div class="event-card-content">

                <span class="event-category">
                    ${categoryLabel}
                </span>


                <h3>
                    ${event.title || "Untitled Event"}
                </h3>


                ${
                    event.description
                    ? `
                        <p class="event-description">
                            ${event.description}
                        </p>
                    `
                    : ""
                }


                <div class="event-meta">

                    <div>
                        📅
                        <span>
                            ${formattedDate}
                        </span>
                    </div>


                    ${
                        timeText
                        ? `
                            <div>
                                🕐
                                <span>
                                    ${timeText}
                                </span>
                            </div>
                        `
                        : ""
                    }


                    ${
                        event.location
                        ? `
                            <div>
                                📍
                                <span>
                                    ${event.location}
                                </span>
                            </div>
                        `
                        : ""
                    }

                </div>


                ${
                    event.registration_required &&
                    event.registration_deadline
                    ? `
                        <p class="event-deadline">
                            Registration closes
                            ${
                                new Date(
                                    event.registration_deadline
                                ).toLocaleDateString()
                            }
                        </p>
                    `
                    : ""
                }


                <div class="event-card-footer">

                    ${
                        event.maximum_participants
                        ? `
                            <span class="event-capacity">
                                👥
                                ${event.maximum_participants}
                                spots
                            </span>
                        `
                        : ""
                    }


                    ${registrationHTML}

                </div>

            </div>

        </article>

    `;
}

// ========================================
// FORMAT EVENT TIME
// ========================================

function formatEventTime(time) {

    if (!time) return "";


    const parts =
        time.split(":");


    if (parts.length < 2) {
        return time;
    }


    const hours =
        parseInt(parts[0], 10);

    const minutes =
        parts[1];


    const suffix =
        hours >= 12
            ? "PM"
            : "AM";


    const displayHour =
        hours % 12 || 12;


    return `${displayHour}:${minutes} ${suffix}`;
}


// ========================================
// REGISTRATION BUTTONS
// ========================================

// ========================================
// REGISTRATION BUTTONS
// ========================================

function attachEventRegistrationButtons() {

    document
        .querySelectorAll(
            ".event-register-btn"
        )
        .forEach(button => {

            if (button.disabled) return;

            button.addEventListener(
                "click",
                () => {

                    const eventId =
                        button.dataset.eventId;

                    if (!eventId) return;

                    registerForEvent(
                        eventId,
                        button
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".event-cancel-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const eventId =
                        button.dataset.eventId;

                    if (!eventId) return;

                    cancelEventRegistration(
                        eventId,
                        button
                    );

                }
            );

        });

}


// ========================================
// REGISTER FOR EVENT
// ========================================

async function registerForEvent(
    eventId,
    button
) {

    button.disabled = true;

    button.textContent =
        "Registering...";


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        alert(
            "Please log in before registering for an event."
        );

        button.disabled = false;

        button.textContent =
            "Register";

        return;
    }


    // Check whether already registered

    const {
        data: existingRegistration,
        error: checkError
    } = await supabaseClient
        .from("event_registration")
        .select("id")
        .eq("event_id", eventId)
        .eq("student_id", user.id)
        .maybeSingle();


    if (checkError) {

        console.error(
            "Could not check registration:",
            checkError
        );

        alert(
            "Could not check your registration."
        );

        button.disabled = false;

        button.textContent =
            "Register";

        return;
    }


    if (existingRegistration) {

        button.textContent =
            "✓ Registered";

        return;
    }


    // Create registration

    // ========================================
// GET STUDENT PROFILE
// ========================================

const {
    data: studentProfile,
    error: profileError
} = await supabaseClient
    .from("profiles")
    .select("full_name, class")
    .eq("id", user.id)
    .single();


if (profileError || !studentProfile) {

    console.error(
        "Could not load student profile:",
        profileError
    );

    alert(
        "Could not load your student profile."
    );

    button.disabled = false;
    button.textContent = "Register";

    return;
}


// ========================================
// CREATE EVENT REGISTRATION
// ========================================

const {
    error: registrationError
} = await supabaseClient
    .from("event_registration")
    .insert([
        {
            event_id: eventId,
            student_id: user.id,
            student_name: studentProfile.full_name,
            class: studentProfile.class,
            status: "registered",
            attended: false,
            registered_at: new Date().toISOString()
        }
    ]);


if (registrationError) {

    console.error(
        "Could not register for event:",
        registrationError
    );

    alert(
        "Registration could not be completed."
    );

    button.disabled = false;
    button.textContent = "Register";

    return;
}


button.textContent = "✓ Registered";

console.log(
    "Successfully registered for event:",
    eventId
);


    if (registrationError) {

        console.error(
            "Could not register for event:",
            registrationError
        );

        alert(
            "Registration could not be completed."
        );

        button.disabled = false;

        button.textContent =
            "Register";

        return;
    }


    button.textContent =
        "✓ Registered";

    console.log(
        "Successfully registered for event:",
        eventId
    );

}

// ========================================
// CANCEL EVENT REGISTRATION
// ========================================

async function cancelEventRegistration(
    eventId,
    button
) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel your registration?"
        );

    if (!confirmed) {
        return;
    }


    button.disabled = true;

    button.textContent =
        "Cancelling...";


    // ========================================
    // GET LOGGED-IN USER
    // ========================================

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        alert(
            "Please log in before cancelling your registration."
        );

        button.disabled = false;

        button.textContent =
            "Cancel Registration";

        return;
    }


    // ========================================
    // CANCEL REGISTRATION
    // ========================================

    const {
        error: cancelError
    } = await supabaseClient
        .from("event_registration")
        .update({
            status: "cancelled",
            cancelled_at:
                new Date().toISOString(),
            updated_at:
                new Date().toISOString()
        })
        .eq("event_id", eventId)
        .eq("student_id", user.id)
        .eq("status", "registered");


    if (cancelError) {

        console.error(
            "Could not cancel registration:",
            cancelError
        );

        alert(
            "Your registration could not be cancelled."
        );

        button.disabled = false;

        button.textContent =
            "Cancel Registration";

        return;
    }


    console.log(
        "Registration cancelled successfully:",
        eventId
    );


    // Reload events so the button
    // changes back to Register

    await loadSchoolEvents();

}

// ========================================
// SEARCH EVENTS
// ========================================

if (eventSearchInput) {

    eventSearchInput.addEventListener(
        "input",
        renderSchoolEvents
    );

}


// ========================================
// FILTER EVENTS
// ========================================

if (eventCategoryFilter) {

    eventCategoryFilter.addEventListener(
        "change",
        renderSchoolEvents
    );

}


// ========================================
// START SCHOOL EVENTS
// ========================================

if (eventList) {

    loadSchoolEvents();

}

// ========================================
// ANNOUNCEMENTS
// ========================================

const announcementList =
    document.getElementById(
        "announcementList"
    );

const announcementSearch =
    document.getElementById(
        "announcementSearch"
    );

const announcementCategoryFilter =
    document.getElementById(
        "announcementCategoryFilter"
    );

let schoolAnnouncements = [];
// ========================================
// LOAD ANNOUNCEMENTS
// ========================================

async function loadSchoolAnnouncements() {

    if (!announcementList) return;


    announcementList.innerHTML = `
        <div class="empty-state">
            Loading announcements...
        </div>
    `;


    const {
    data: announcements,
    error
} = await supabaseClient
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .or(
        "expires_at.is.null,expires_at.gt." +
        new Date().toISOString()
    )
    .order(
        "published_at",
        {
            ascending: false
        }
    );


    if (error) {

        console.error(
            "Could not load announcements:",
            error
        );


        announcementList.innerHTML = `
            <div class="empty-state">
                Could not load announcements.
            </div>
        `;

        return;
    }


    schoolAnnouncements =
        announcements || [];


    renderSchoolAnnouncements();

}
// ========================================
// CREATE ANNOUNCEMENT CARD
// ========================================

function createAnnouncementCard(announcement) {

    const category =
        announcement.category || "General";


    const categoryLabel =
        category.charAt(0).toUpperCase() +
        category.slice(1);


    // ========================================
    // PRIORITY
    // ========================================

    const priority =
        announcement.priority || "normal";


    const priorityLabel =
        priority.charAt(0).toUpperCase() +
        priority.slice(1);


    // ========================================
    // DATE
    // ========================================

    let formattedDate =
        "Date not available";


    if (announcement.published_at) {

        formattedDate =
            new Date(
                announcement.published_at
            ).toLocaleDateString(
                undefined,
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

    }


    // ========================================
    // ATTACHMENT
    // ========================================

    const attachmentHTML =
        announcement.attachment_url
            ? `
                <a
                    href="${announcement.attachment_url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="announcement-attachment"
                >
                    📎 View Attachment
                </a>
            `
            : "";


    // ========================================
    // PRIORITY BADGE
    // ========================================

    const priorityHTML =
        priority.toLowerCase() === "high"
            ? `
                <span class="announcement-priority high">
                    🔴 Important
                </span>
            `
            : "";


    // ========================================
    // CARD
    // ========================================

    return `

        <article
            class="announcement-card"
            data-announcement-id="${announcement.id}"
        >

            <div class="announcement-card-top">

                <div class="announcement-icon">
                    📢
                </div>


                <div class="announcement-card-labels">

                    <span class="announcement-category">
                        ${categoryLabel}
                    </span>

                    ${priorityHTML}

                </div>

            </div>


            <div class="announcement-card-content">

                <h3>
                    ${announcement.title || "Untitled Announcement"}
                </h3>


                ${
                    announcement.content
                    ? `
                        <p class="announcement-content">
                            ${announcement.content}
                        </p>
                    `
                    : ""
                }


                <div class="announcement-meta">

                    <span>
                        📅 ${formattedDate}
                    </span>

                </div>


                ${attachmentHTML}

            </div>

        </article>

    `;
}
// ========================================
// RENDER ANNOUNCEMENTS
// ========================================

function renderSchoolAnnouncements() {

    if (!announcementList) return;


    const searchTerm =
        announcementSearch?.value
            .trim()
            .toLowerCase() || "";


    const selectedCategory =
        announcementCategoryFilter?.value || "all";


    const filteredAnnouncements =
        schoolAnnouncements.filter(
            announcement => {

                const matchesSearch =
                    !searchTerm ||
                    announcement.title
                        ?.toLowerCase()
                        .includes(searchTerm) ||
                    announcement.content
                        ?.toLowerCase()
                        .includes(searchTerm);


                const matchesCategory =
                    selectedCategory === "all" ||
                    announcement.category
                        ?.toLowerCase()
                        === selectedCategory.toLowerCase();


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    if (!filteredAnnouncements.length) {

        announcementList.innerHTML = `
            <div class="empty-state">
                No announcements found.
            </div>
        `;

        return;
    }


    announcementList.innerHTML =
        filteredAnnouncements
            .map(
                createAnnouncementCard
            )
            .join("");

}
// ========================================
// ANNOUNCEMENT SEARCH
// ========================================

if (announcementSearch) {

    announcementSearch.addEventListener(
        "input",
        renderSchoolAnnouncements
    );

}


// ========================================
// ANNOUNCEMENT CATEGORY FILTER
// ========================================

if (announcementCategoryFilter) {

    announcementCategoryFilter.addEventListener(
        "change",
        renderSchoolAnnouncements
    );

}
// ========================================
// START ANNOUNCEMENTS
// ========================================

if (announcementList) {

    loadSchoolAnnouncements();

}
// ========================================
// SAVED CAREERS
// ========================================

const savedCareerList =
    document.getElementById(
        "savedCareerList"
    );

const savedCareerSearch =
    document.getElementById(
        "savedCareerSearch"
    );

const savedCareerCategoryFilter =
    document.getElementById(
        "savedCareerCategoryFilter"
    );

let savedCareers = [];

// ========================================
// SAVE CAREER TO SUPABASE
// ========================================

async function saveCareerToSupabase(category, career) {

    try {

        // Get logged-in student
        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            alert("Please log in again.");
            return;
        }

        // Check if career is already saved
        const {
            data: existingCareer,
            error: checkError
        } = await supabaseClient
            .from("saved_careers")
            .select("id")
            .eq("student_id", user.id)
            .eq("career_name", career.title)
            .maybeSingle();

        if (checkError) {
            console.error(
                "Could not check saved career:",
                checkError
            );
            alert("Unable to save this career. Please try again.");
            return;
        }

        // Already saved
        if (existingCareer) {
            alert("This career is already saved.");
            return;
        }

        // Save to Supabase
        const {
            error: insertError
        } = await supabaseClient
            .from("saved_careers")
            .insert({
                student_id: user.id,
                career_name: career.title,
                career_category: career.field,
                notes: null
            });

        if (insertError) {
            console.error(
                "Could not save career:",
                insertError
            );

            alert("Could not save career. Please try again.");
            return;
        }

        // Update local button appearance
        document
            .querySelectorAll(
                `.career-save-btn[data-career="${category}"]`
            )
            .forEach(button => {

                button.classList.add("saved");
                button.textContent = "💜 Saved";

            });

        // Refresh Saved Careers data
        await loadSavedCareers();

        alert(`${career.title} has been saved!`);

    } catch (error) {

        console.error(
            "Save career error:",
            error
        );

        alert("Something went wrong while saving the career.");

    }

}


// ========================================
// LOAD SAVED CAREERS
// ========================================

async function loadSavedCareers() {

    if (!savedCareerList) return;


    savedCareerList.innerHTML = `
        <div class="empty-state">
            Loading saved careers...
        </div>
    `;


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

console.log("Saved Careers User:", user);


    if (userError || !user) {

        savedCareerList.innerHTML = `
            <div class="empty-state">
                Please log in to view your saved careers.
            </div>
        `;

        return;
    }


    const {
        data: careers,
        error
    } = await supabaseClient
        .from("saved_careers")
        .select("*")
        .eq("student_id", user.id)
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Could not load saved careers:",
            error
        );


        savedCareerList.innerHTML = `
            <div class="empty-state">
                Could not load saved careers.
            </div>
        `;

        return;
    }


    savedCareers =
    careers || [];


updateSavedCareerCategories();

renderSavedCareers();

}
// ========================================
// CREATE SAVED CAREER CARD
// ========================================

function createSavedCareerCard(career) {

    return `
        <article
            class="saved-career-card"
            data-career-id="${career.id}"
        >

            <div class="saved-career-icon">
                🧭
            </div>


            <div class="saved-career-content">

                <span class="saved-career-category">
                    ${career.career_category || "Career"}
                </span>


                <h3>
                    ${career.career_name || "Unnamed Career"}
                </h3>


                ${
                    career.notes
                    ? `
                        <p class="saved-career-notes">
                            ${career.notes}
                        </p>
                    `
                    : `
                        <p class="saved-career-notes empty">
                            No notes added yet.
                        </p>
                    `
                }


                <div class="saved-career-meta">

                    <span>
                        💜 Saved Career
                    </span>

                </div>

            </div>


            <button
                type="button"
                class="saved-career-remove-btn"
                data-career-id="${career.id}"
                title="Remove saved career"
            >
                ♡
            </button>

        </article>
    `;
}
// ========================================
// RENDER SAVED CAREERS
// ========================================

function renderSavedCareers() {

    if (!savedCareerList) return;


    const searchTerm =
        savedCareerSearch?.value
            .trim()
            .toLowerCase() || "";


    const selectedCategory =
        savedCareerCategoryFilter?.value || "all";


    const filteredCareers =
        savedCareers.filter(
            career => {

                const matchesSearch =
                    !searchTerm ||
                    career.career_name
                        ?.toLowerCase()
                        .includes(searchTerm) ||
                    career.career_category
                        ?.toLowerCase()
                        .includes(searchTerm) ||
                    career.notes
                        ?.toLowerCase()
                        .includes(searchTerm);


                const matchesCategory =
                    selectedCategory === "all" ||
                    career.career_category
                        ?.toLowerCase()
                        === selectedCategory.toLowerCase();


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    if (!filteredCareers.length) {

        savedCareerList.innerHTML = `
            <div class="empty-state">
                No saved careers found.
            </div>
        `;

        return;
    }


    savedCareerList.innerHTML =
        filteredCareers
            .map(
                createSavedCareerCard
            )
            .join("");

}
// ========================================
// UPDATE SAVED CAREER CATEGORIES
// ========================================

function updateSavedCareerCategories() {

    if (!savedCareerCategoryFilter) return;


    const categories =
        [
            ...new Set(
                savedCareers
                    .map(
                        career =>
                            career.career_category
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    savedCareerCategoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.toLowerCase();

        option.textContent =
            category;

        savedCareerCategoryFilter.appendChild(
            option
        );

    });

}
// ========================================
// SAVED CAREER SEARCH
// ========================================

if (savedCareerSearch) {

    savedCareerSearch.addEventListener(
        "input",
        renderSavedCareers
    );

}


// ========================================
// SAVED CAREER CATEGORY FILTER
// ========================================

if (savedCareerCategoryFilter) {

    savedCareerCategoryFilter.addEventListener(
        "change",
        renderSavedCareers
    );

}
// ========================================
// START SAVED CAREERS
// ========================================

if (savedCareerList) {

    loadSavedCareers();

}
// ========================================
// NAVENTRA NOTIFICATIONS
// ========================================

let notificationsData = [];

const notificationList =
    document.getElementById("notificationList");

const unreadNotificationCount =
    document.getElementById("unreadNotificationCount");

const markAllNotificationsReadBtn =
    document.getElementById(
        "markAllNotificationsReadBtn"
    );


// ========================================
// LOAD NOTIFICATIONS
// ========================================

async function loadNotifications() {

    if (!notificationList) return;


    notificationList.innerHTML = `
        <div class="empty-state">
            Loading notifications...
        </div>
    `;


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        notificationList.innerHTML = `
            <div class="empty-state">
                Please log in to view your notifications.
            </div>
        `;

        return;
    }


    const now = new Date().toISOString();


    const {
        data,
        error
    } = await supabaseClient
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Could not load notifications:",
            error
        );


        notificationList.innerHTML = `
            <div class="empty-state">
                Could not load notifications.
            </div>
        `;

        return;
    }


    notificationsData = data || [];


    updateNotificationCount();

    renderNotifications();

}


// ========================================
// UPDATE UNREAD COUNT
// ========================================

function updateNotificationCount() {

    const unreadCount =
        notificationsData.filter(
            notification =>
                !notification.is_read
        ).length;


    if (unreadNotificationCount) {

        unreadNotificationCount.textContent =
            `${unreadCount} ${
                unreadCount === 1
                    ? "unread"
                    : "unread"
            }`;

    }


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (badge) {

        badge.textContent =
            unreadCount;

        badge.style.display =
            unreadCount > 0
                ? "flex"
                : "none";

    }

}


// ========================================
// NOTIFICATION ICON
// ========================================

function getNotificationIcon(type) {

    const icons = {

        announcement: "📢",
        event: "📅",
        resource: "📚",
        achievement: "🏆",
        career: "🧭",
        lost_found: "🔍",
        lostfound: "🔍",
        reminder: "⏰",
        important: "⚠️",
        general: "🔔"

    };


    return (
        icons[
            String(type || "")
                .toLowerCase()
        ] || "🔔"
    );

}


// ========================================
// RENDER NOTIFICATIONS
// ========================================

function renderNotifications(
    filter = "all"
) {

    if (!notificationList) return;


    let filtered =
        notificationsData;


    if (filter === "unread") {

        filtered =
            notificationsData.filter(
                notification =>
                    !notification.is_read
            );

    }


    if (!filtered.length) {

        notificationList.innerHTML = `
            <div class="empty-state">

                <div style="font-size:32px;">
                    🔔
                </div>

                <h3>
                    No notifications
                </h3>

                <p>
                    You're all caught up!
                </p>

            </div>
        `;

        return;

    }


    notificationList.innerHTML =
        filtered.map(
            notification => {

                const unread =
                    !notification.is_read;


                const date =
                    notification.created_at
                        ? new Date(
                            notification.created_at
                        ).toLocaleString(
                            [],
                            {
                                dateStyle: "medium",
                                timeStyle: "short"
                            }
                        )
                        : "";


                return `

                    <article
                        class="notification-card ${
                            unread
                                ? "unread"
                                : ""
                        }"
                        data-notification-id="${
                            notification.id
                        }"
                    >

                        <div class="notification-icon">
                            ${
                                getNotificationIcon(
                                    notification.type
                                )
                            }
                        </div>


                        <div class="notification-content">

                            <div class="notification-top">

                                <div>

                                    <h3>
                                        ${
                                            notification.title ||
                                            "Notification"
                                        }
                                    </h3>

                                    ${
                                        unread
                                            ? `
                                                <span class="notification-unread-dot">
                                                </span>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>


                            <p>
                                ${
                                    notification.message ||
                                    ""
                                }
                            </p>


                            <div class="notification-meta">

                                <span>
                                    🕒 ${date}
                                </span>

                                ${
                                    notification.priority
                                        ? `
                                            <span class="notification-priority">
                                                ${
                                                    notification.priority
                                                }
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            ${
                                unread
                                    ? `
                                        <button
                                            type="button"
                                            class="notification-read-btn"
                                            data-id="${
                                                notification.id
                                            }"
                                        >
                                            ✓ Mark as read
                                        </button>
                                    `
                                    : `
                                        <span class="notification-read-label">
                                            ✓ Read
                                        </span>
                                    `
                            }

                        </div>

                    </article>

                `;

            }
        ).join("");

}


// ========================================
// NOTIFICATION FILTERS
// ========================================

document
    .querySelectorAll(
        ".notification-filter"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".notification-filter"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                renderNotifications(
                    button.dataset.filter
                );

            }
        );

    });


// ========================================
// MARK ONE NOTIFICATION AS READ
// ========================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".notification-read-btn"
            );


        if (!button) return;


        const notificationId =
            button.dataset.id;


        if (!notificationId) return;


        button.disabled = true;


        const {
            error
        } = await supabaseClient
            .from("notifications")
            .update({
                is_read: true,
                read_at:
                    new Date().toISOString()
            })
            .eq(
                "id",
                notificationId
            );


        if (error) {

            console.error(
                "Could not mark notification as read:",
                error
            );

            button.disabled = false;

            return;
        }


        const notification =
            notificationsData.find(
                item =>
                    String(item.id) ===
                    String(notificationId)
            );


        if (notification) {

            notification.is_read = true;

            notification.read_at =
                new Date().toISOString();

        }


        updateNotificationCount();


        const activeFilter =
            document.querySelector(
                ".notification-filter.active"
            );


        renderNotifications(
            activeFilter?.dataset.filter ||
            "all"
        );

    }
);


// ========================================
// MARK ALL NOTIFICATIONS AS READ
// ========================================

if (markAllNotificationsReadBtn) {

    markAllNotificationsReadBtn.addEventListener(
        "click",
        async () => {

            const {
                data: { user },
                error: userError
            } =
                await supabaseClient.auth.getUser();


            if (userError || !user) {

                alert(
                    "Please log in again."
                );

                return;

            }


            const unread =
                notificationsData.filter(
                    notification =>
                        !notification.is_read
                );


            if (!unread.length) {

                return;

            }


            const {
                error
            } = await supabaseClient
                .from("notifications")
                .update({
                    is_read: true,
                    read_at:
                        new Date().toISOString()
                })
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "is_read",
                    false
                );


            if (error) {

                console.error(
                    "Could not mark all notifications as read:",
                    error
                );

                alert(
                    "Could not update notifications."
                );

                return;

            }


            notificationsData =
                notificationsData.map(
                    notification => ({
                        ...notification,
                        is_read: true,
                        read_at:
                            new Date().toISOString()
                    })
                );


            updateNotificationCount();

            renderNotifications();

        }
    );

}


// ========================================
// START NOTIFICATIONS
// ========================================

if (notificationList) {

    loadNotifications();

}
// ========================================
// CREATE NOTIFICATION
// ========================================

async function createNotification({
    userId,
    title,
    message,
    type = "general",
    priority = "normal",
    link = null,
    relatedId = null,
    relatedType = null
}) {

    if (!userId) {
        console.error("Notification requires a user ID.");
        return false;
    }
    const {
    data: { user },
    error: userError
} = await supabaseClient.auth.getUser();

console.log("NOTIFICATION USER:", user);
console.log("NOTIFICATION USER ID:", user?.id);

    const { error } = await supabaseClient
        .from("notifications")
        .insert({
            user_id: userId,
            title: title,
            message: message,
            type: type,
            priority: priority,
            is_read: false,
            link: link,
            related_id: relatedId,
            related_type: relatedType
        });

    if (error) {

        console.error(
            "Could not create notification:",
            error
        );

        return false;
    }

    return true;
}
// ========================================
// HELP & SUPPORT
// ========================================

const helpContent =
document.getElementById("helpContent");

const helpButtons =
document.querySelectorAll(".help-action-btn");

const helpArticles = {

"getting-started": `
    <span class="section-label">GETTING STARTED</span>

    <h3>Welcome to Naventra 🚀</h3>

    <p>
        Naventra is your student portal for discovering
        school updates, career opportunities, achievements
        and useful student services.
    </p>

    <h4>🏠 Dashboard</h4>
    <p>
        Your dashboard gives you a quick overview of
        important school information, saved careers,
        announcements and upcoming events.
    </p>

    <h4>🧭 Career Guidance</h4>
    <p>
        Take the Career Assessment to discover career
        paths that match your interests and strengths.
    </p>

    <h4>🏆 Achievement Vault</h4>
    <p>
        Store and organize your awards, certificates,
        badges and medals in one place.
    </p>

    <h4>🔔 Notifications</h4>
    <p>
        Check notifications regularly for important
        school updates, events and announcements.
    </p>
`,


"career": `
    <span class="section-label">CAREER GUIDANCE</span>

    <h3>Need help with Career Guidance? 🧭</h3>

    <h4>1. Take the Assessment</h4>
    <p>
        Answer the assessment questions honestly.
        Your answers are used to identify career paths
        that may match your interests and strengths.
    </p>

    <h4>2. View Your Results</h4>
    <p>
        After completing the assessment, you'll see
        your top career matches and their match scores.
    </p>

    <h4>3. Save Careers</h4>
    <p>
        Use the 💜 Save button to add careers to your
        Saved Careers collection.
    </p>

    <h4>4. Explore Careers</h4>
    <p>
        Open Career Explorer to learn about career fields,
        skills, education requirements and career roadmaps.
    </p>
`,


"lost-found": `
    <span class="section-label">LOST & FOUND</span>

    <h3>How Lost & Found works 🔍</h3>

    <h4>Search for an item</h4>
    <p>
        Use the search bar and filters to find items
        listed by your school.
    </p>

    <h4>Check the details</h4>
    <p>
        Review the item's description, location and
        verification status.
    </p>

    <h4>Submit a claim</h4>
    <p>
        If you believe an item belongs to you, click
        <strong>This is Mine</strong> and submit the
        requested information.
    </p>

    <h4>Wait for verification</h4>
    <p>
        Your school will review the claim before the
        item can be returned.
    </p>
`,


"notifications": `
    <span class="section-label">NOTIFICATIONS</span>

    <h3>Managing your notifications 🔔</h3>

    <h4>Unread notifications</h4>
    <p>
        New notifications are marked as unread so you
        can easily identify important updates.
    </p>

    <h4>Mark as Read</h4>
    <p>
        Open a notification and use the
        <strong>Mark as Read</strong> option when you've
        finished reading it.
    </p>

    <h4>Mark All as Read</h4>
    <p>
        Use this option when you want to clear all
        unread notifications at once.
    </p>
`

};

helpButtons.forEach(button => {

button.addEventListener("click", () => {

    const topic =
        button.dataset.help;

    if (!helpContent || !helpArticles[topic]) {
        return;
    }

    helpContent.innerHTML =
        helpArticles[topic];

    helpContent.style.display =
        "block";

    helpContent.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});

});

// ========================================
// CONTACT SCHOOL SUPPORT
// ========================================

const contactSupportBtn =
document.getElementById("contactSupportBtn");

const supportModal =
document.getElementById("supportModal");

const supportModalClose =
document.getElementById("supportModalClose");

const supportForm =
document.getElementById("supportForm");

if (contactSupportBtn && supportModal) {

contactSupportBtn.addEventListener(
    "click",
    () => {

        supportModal.classList.add("active");

    }
);

}

if (supportModalClose && supportModal) {

supportModalClose.addEventListener(
    "click",
    () => {

        supportModal.classList.remove("active");

    }
);

}

if (supportModal) {

supportModal.addEventListener(
    "click",
    event => {

        if (event.target === supportModal) {

            supportModal.classList.remove("active");

        }

    }
);

}

if (supportForm) {

supportForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        alert(
            "Your support request has been recorded. Please contact your school support team for further assistance."
        );

        supportForm.reset();

        if (supportModal) {
            supportModal.classList.remove("active");
        }

    }
);

}
// ========================================
// PROFILE PAGE
// ========================================

async function loadProfilePage() {

    const profilePage =
        document.getElementById("profilePage");

    if (!profilePage) return;

    profilePage.innerHTML = `
        <div class="portal-page-header">
            <span class="section-label">MY ACCOUNT</span>

            <h2>Your Profile 👤</h2>

            <p>
                View your student information and account details.
            </p>
        </div>

        <div class="profile-page-card">

            <div class="profile-page-top">

                <div class="profile-page-avatar" id="profilePageAvatar">
                    <span id="profilePageInitials">ST</span>
                </div>

                <div>
                    <span class="section-label">STUDENT PROFILE</span>

                    <h2 id="profilePageName">
                        Loading...
                    </h2>

                    <p id="profilePageRole">
                        Loading...
                    </p>
                </div>

            </div>


            <div class="profile-details-grid">

                <div class="profile-detail-item">
                    <span>👤 Full Name</span>
                    <strong id="profileFullName">
                        Loading...
                    </strong>
                </div>


                <div class="profile-detail-item">
                    <span>📧 Email</span>
                    <strong id="profileEmail">
                        Loading...
                    </strong>
                </div>


                <div class="profile-detail-item">
                    <span>🎓 Class</span>
                    <strong id="profileClass">
                        Loading...
                    </strong>
                </div>


                <div class="profile-detail-item">
                    <span>🛡️ Account Role</span>
                    <strong id="profileRole">
                        Loading...
                    </strong>
                </div>


                <div class="profile-detail-item">
                    <span>🆔 Student ID</span>
                    <strong id="profileStudentId">
                        Loading...
                    </strong>
                </div>


                <div class="profile-detail-item">
                    <span>📅 Member Since</span>
                    <strong id="profileCreatedAt">
                        Loading...
                    </strong>
                </div>

            </div>

        </div>
    `;


    try {

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError || !user) {

            profilePage.innerHTML = `
                <div class="empty-state">
                    Please log in again to view your profile.
                </div>
            `;

            return;
        }


        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select("id, created_at, full_name, role, class")
            .eq("id", user.id)
            .maybeSingle();


        if (profileError) {

            console.error(
                "Could not load profile:",
                profileError
            );

            profilePage.innerHTML = `
                <div class="empty-state">
                    Could not load your profile.
                </div>
            `;

            return;
        }


        if (!profile) {

            profilePage.innerHTML = `
                <div class="empty-state">
                    Your profile information could not be found.
                </div>
            `;

            return;
        }


        const fullName =
            profile.full_name || "Student";


        const initials =
            fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(name => name[0])
                .join("")
                .toUpperCase();


        document.getElementById(
            "profilePageInitials"
        ).textContent = initials || "ST";


        document.getElementById(
            "profilePageName"
        ).textContent = fullName;


        document.getElementById(
            "profilePageRole"
        ).textContent =
            profile.role
                ? profile.role.charAt(0).toUpperCase()
                    + profile.role.slice(1)
                : "Student";


        document.getElementById(
            "profileFullName"
        ).textContent =
            fullName;


        document.getElementById(
            "profileEmail"
        ).textContent =
            user.email || "Not available";


        document.getElementById(
            "profileClass"
        ).textContent =
            profile.class || "Not provided";


        document.getElementById(
            "profileRole"
        ).textContent =
            profile.role || "Student";


        document.getElementById(
            "profileStudentId"
        ).textContent =
            user.id;


        document.getElementById(
            "profileCreatedAt"
        ).textContent =
            profile.created_at
                ? new Date(
                    profile.created_at
                ).toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                )
                : "Not available";


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }

}


// ========================================
// START PROFILE
// ========================================

if (
    document.getElementById("profilePage")
) {

    loadProfilePage();

}

// ========================================
// NAVENTRA TEACHER PORTAL NAVIGATION
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // Only run on Teacher Portal
    var teacherPortal =
        document.querySelector(".teacher-portal-page");

    if (!teacherPortal) {
        return;
    }


    var teacherSidebar =
        document.getElementById("teacherSidebar");

    var teacherMenuBtn =
        document.getElementById("teacherMenuBtn");

    var teacherPageTitle =
        document.getElementById("teacherPageTitle");


    var sidebarLinks =
        document.querySelectorAll(
            ".teacher-sidebar-link"
        );


    var actionButtons =
        document.querySelectorAll(
            ".teacher-action-card, .teacher-view-all-btn"
        );


    // ========================================
    // SHOW TEACHER PAGE
    // ========================================

    function showTeacherPage(pageId, pageTitle) {

        var sections =
            document.querySelectorAll(
                ".teacher-section"
            );


        sections.forEach(function (section) {

            section.classList.remove("active");

        });


        var selectedSection =
            document.getElementById(pageId);


        if (selectedSection) {

            selectedSection.classList.add("active");

        }


        sidebarLinks.forEach(function (link) {

            link.classList.remove("active");

        });


        var activeLink =
            document.querySelector(
                '.teacher-sidebar-link[data-page="' +
                pageId +
                '"]'
            );


        if (activeLink) {

            activeLink.classList.add("active");

        }


        if (teacherPageTitle) {

            teacherPageTitle.textContent =
                pageTitle || "Dashboard";

        }


        if (teacherSidebar) {

            teacherSidebar.classList.remove("open");

        }


        window.scrollTo(0, 0);

    }


    // ========================================
    // SIDEBAR NAVIGATION
    // ========================================

    sidebarLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                var pageId =
                    link.getAttribute("data-page");

                var pageTitle =
                    link.getAttribute("data-title");


                if (!pageId) {
                    return;
                }


                showTeacherPage(
                    pageId,
                    pageTitle
                );

            }
        );

    });


    // ========================================
    // QUICK ACTION BUTTONS
    // ========================================

    actionButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                var pageId =
                    button.getAttribute("data-page");


                if (!pageId) {
                    return;
                }


                var matchingLink =
    document.querySelector(
        '.sidebar-link[data-page="' +
        pageId +
        '"]'
    );


                var pageTitle =
                    "Dashboard";


                if (matchingLink) {

                    pageTitle =
                        matchingLink.getAttribute(
                            "data-title"
                        ) || "Dashboard";

                }


                showTeacherPage(
                    pageId,
                    pageTitle
                );

            }
        );

    });


    // ========================================
    // MOBILE MENU BUTTON
    // ========================================

    if (
        teacherMenuBtn &&
        teacherSidebar
    ) {

        teacherMenuBtn.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                teacherSidebar.classList.toggle(
                    "open"
                );

            }
        );

    }


    // ========================================
    // CLOSE MOBILE SIDEBAR
    // ========================================

    document.addEventListener(
        "click",
        function (event) {

            if (window.innerWidth > 800) {
                return;
            }


            if (
                !teacherSidebar ||
                !teacherSidebar.classList.contains("open")
            ) {
                return;
            }


            if (
                teacherSidebar.contains(
                    event.target
                )
            ) {
                return;
            }


            if (
                teacherMenuBtn &&
                teacherMenuBtn.contains(
                    event.target
                )
            ) {
                return;
            }


            teacherSidebar.classList.remove(
                "open"
            );

        }
    );


    // ========================================
    // INITIAL PAGE
    // ========================================

    showTeacherPage(
        "teacher-dashboard",
        "Dashboard"
    );

});

// ========================================
// LOAD STUDENT RESOURCES
// ========================================

async function loadStudentResources() {

    const resourcesList =
        document.getElementById("studentResourcesList");

    const resourceCount =
        document.getElementById("resourceCount");

    if (!resourcesList) {
        return;
    }

    resourcesList.innerHTML = `
        <div class="student-resource-loading">
            📚 Loading resources...
        </div>
    `;

    try {

        const { data, error } =
            await supabaseClient
                .from("resources")
                .select("*")
                .eq("is_published", true)
                .order("created_at", {
                    ascending: false
                });

        if (error) {

            console.error(
                "Could not load resources:",
                error
            );

            resourcesList.innerHTML = `
                <div class="student-resource-empty">
                    <div>⚠️</div>

                    <h3>
                        Could not load resources
                    </h3>

                    <p>
                        Please try refreshing the page.
                    </p>
                </div>
            `;

            return;
        }

        const resources = data || [];

        if (resourceCount) {

            resourceCount.textContent =
                resources.length +
                (
                    resources.length === 1
                        ? " resource"
                        : " resources"
                );

        }

        renderStudentResources(resources);

    } catch (error) {

        console.error(
            "Resource loading error:",
            error
        );

        resourcesList.innerHTML = `
            <div class="student-resource-empty">
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
// RENDER STUDENT RESOURCES
// ========================================

function renderStudentResources(resources) {

    const resourcesList =
        document.getElementById("studentResourcesList");

    if (!resourcesList) {
        return;
    }

    if (!resources.length) {

        resourcesList.innerHTML = `
            <div class="student-resource-empty">

                <div>📚</div>

                <h3>
                    No resources available
                </h3>

                <p>
                    Your school hasn't published
                    any resources yet.
                </p>

            </div>
        `;

        return;
    }


    resourcesList.innerHTML =
        resources.map(function (resource) {

            const resourceType =
                resource.resource_type ||
                "Resource";

            const category =
                resource.category ||
                "General";

            const description =
                resource.description ||
                "No description provided.";


            return `

                <article class="student-resource-card">

                    <div class="student-resource-card-top">

                        <div class="student-resource-icon">
                            📚
                        </div>

                        <span class="student-resource-type">
                            ${resourceType}
                        </span>

                    </div>


                    <div class="student-resource-content">

                        <span class="student-resource-category">
                            ${category}
                        </span>

                        <h3>
                            ${resource.title || "Untitled Resource"}
                        </h3>

                        <p>
                            ${description}
                        </p>

                    </div>


                    <div class="student-resource-footer">

                        <span>
                            Downloads:
                            ${resource.download_count || 0}
                        </span>

                        ${
                            resource.file_url
                                ? `
                                    <a
                                        href="${resource.file_url}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="student-resource-open"
                                    >
                                        Open Resource ↗
                                    </a>
                                `
                                : resource.external_url
                                    ? `
                                        <a
                                            href="${resource.external_url}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="student-resource-open"
                                        >
                                            Open Resource ↗
                                        </a>
                                    `
                                    : `
                                        <span>
                                            No link available
                                        </span>
                                    `
                        }

                    </div>

                </article>

            `;

        }).join("");
}