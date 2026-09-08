/**
 * Every string the manager sees lives here.
 * Onboarding a new client: edit this file, redeploy their dashboard.
 * The hostel's name still comes from the database — everything else
 * (labels, headings, empty states, toasts) is curated here.
 */
export const content = {
  brand: {
    productLabel: "Manager",
    managedBy: "Site by 404notnull",
  },
  /** Branch scoping (FR-B6): caretaker deployments are branch-locked. */
  branchScope: {
    caretakerFor: "Caretaker",
  },
  nav: {
    inbox: "Enquiries",
    rooms: "Rooms",
    branches: "Branches",
    share: "Share",
    backToBranches: "All branches",
  },
  /** The Branches hub — home for a multi-branch hostel (FR-B6a). */
  branchesView: {
    heading: "Branches.",
    description:
      "Every branch at a glance. Open one to work its enquiries and rooms.",
    roomsOpen: "rooms open",
    newEnquiries: "new",
  },
  share: {
    heading: "Share your site.",
    description:
      "One link for everything — send it on WhatsApp, put it on your status, or print the QR code on flyers and noticeboards.",
    notConfigured:
      "Your website address hasn't been set up yet. Ask the person who built your site to add it.",
    copyLink: "Copy link",
    copied: "Link copied",
    downloadQr: "Download QR code",
    qrHint: "Scanning this opens your website — it works on flyers, noticeboards, and WhatsApp status.",
    openSite: "Open your website",
  },
  inquiry: {
    email: "Email",
    guardian: "Guardian",
    reference: "Ref",
    roomCode: "Room code",
    roomCodeHint:
      "Issued when you mark them booked — e.g. FRANCO-2026-001. It never changes; they show it at move-in.",
    copyCode: "Copy code",
    codeCopied: "Code copied",
    shareCode: "Share code",
    delete: "Delete",
    deleted: "Enquiry deleted",
  },
  stats: {
    newEnquiries: "New enquiries",
    roomsAvailable: "Rooms available",
  },
  inbox: {
    heading: "Enquiries.",
    description:
      "Every student who asks about a room on your website appears here. Reply on WhatsApp, then mark where they are.",
    emptyTitle: "No enquiries yet.",
    emptyBody:
      "When a student sends the form on your website, they'll show up here with their phone number and the room they want.",
    filterAll: "All",
    searchPlaceholder: "Search name, phone, room, code or email…",
    noMatchesTitle: "Nothing here.",
    noMatchesBody: "No enquiries match that filter or search.",
    clearAll: "Clear all enquiries",
    clearHint: "End of the academic year? Clear the inbox and start a fresh campaign.",
    clearConfirm: "Yes, clear them",
    clearKeep: "Keep them",
    cleared: "Inbox cleared",
  },
  rooms: {
    heading: "Rooms & rates.",
    descriptionUnit:
      "These rooms and prices go live on your website the moment you save them.",
    descriptionMulti:
      "Each branch keeps its own rooms. Changes go live on your website the moment you save them.",
    addRoom: "Add room",
    details: "Edit details",
    roomsLeft: "Rooms left",
    perYear: "/ academic year",
    accepting: "Accepting enquiries",
    notAccepting: "Not accepting",
    decreaseAvailable: "One room fewer",
    increaseAvailable: "One room more",
    emptyRoomsTitle: "No rooms yet.",
    emptyRoomsBody:
      "Add your first room — its name, price, and how many are free. It appears on your website immediately.",
    emptyBranchesTitle: "No branches yet.",
    emptyBranchesBody:
      "Your site's branches are set up by the person who built it. Ask them to add this hostel's branches.",
    emptyBranchRooms: "No rooms in this branch yet.",
  },
  branch: {
    note: "Location note",
    notePlaceholder: "e.g. 12 min walk from the main gate",
    editTitle: "Edit branch",
    editDescription:
      "Update this branch’s directions — how students find the building. The branch itself (name, photos) is part of your site’s structure; ask the person who built it to change those.",
    save: "Save branch",
  },
  room: {
    name: "Room name",
    namePlaceholder: "e.g. 4-in-1",
    occupancy: "Occupancy",
    bath: "Bathroom",
    price: "Price per academic year",
    available: "Rooms available",
    accepting: "Accepting enquiries",
    acceptingHint: "Turn this off and students can't inquire about this room.",
    amenities: "Amenities",
    addTitle: "Add room",
    editTitle: "Edit room",
    save: "Save room",
    delete: "Delete room",
    nameRequired: "Give the room a name.",
    priceInvalid: "Whole cedis only — numbers, no letters or symbols.",
    availableInvalid: "Rooms available must be a whole number, zero or more.",
  },
  confirmDelete: "Tap again to confirm",
  statuses: {
    new: "New",
    contacted: "Contacted",
    booked: "Booked",
  } satisfies Record<"new" | "contacted" | "booked", string>,
  occupancyLabels: {
    1: "1-in-1",
    2: "2-in-1",
    3: "3-in-1",
    4: "4-in-1",
  } satisfies Record<1 | 2 | 3 | 4, string>,
  bathLabels: {
    shared: "Shared bath",
    ensuite: "Ensuite",
  } satisfies Record<"shared" | "ensuite", string>,
  amenities: [
    { value: "power-backup", label: "24/7 power backup" },
    { value: "water-storage", label: "Reliable water" },
    { value: "wifi", label: "Wi-Fi" },
    { value: "security", label: "On-site security" },
    { value: "cctv", label: "CCTV" },
    { value: "kitchen", label: "Shared kitchen" },
    { value: "study-room", label: "Study room" },
    { value: "ac", label: "Air conditioning" },
  ] as Array<{ value: string; label: string }>,
  toasts: {
    roomAdded: "Room added",
    roomSaved: "Room saved",
    roomDeleted: "Room removed",
    branchSaved: "Branch saved",
    saveFailed: "Couldn't save — check the details and try again",
  },
  states: {
    loading: "Loading your dashboard…",
    notConfigured: "This dashboard isn't connected to a hostel yet.",
    askSupport:
      "Ask the person who set up your website to check the dashboard settings.",
  },
};
