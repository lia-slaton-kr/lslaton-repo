/* ============================================================
   Mock data — stand-in for what would come from the
   Status Aggregation Service, Error Taxonomy Service, and
   Banner Health Service in the real system.
   ============================================================ */

window.MOCK = (function () {
  // Stage display order, used by both supplier + agent views
  const STAGES = [
    { name: "SUBMISSION",       displayName: "Submitted to Kroger" },
    { name: "KIA_VALIDATION",   displayName: "Kroger Validation" },
    { name: "IMF_STATUS",       displayName: "Item Master File" },
    { name: "PIM_ENRICHMENT",   displayName: "Master Data Enrichment" },
    { name: "PRODUCT_DOMAIN",   displayName: "Web Publishing" },
    { name: "PDP_PUBLISHED",    displayName: "Live on Kroger.com" },
    { name: "BANNER_HARRIS_TEETER", displayName: "Live on Harris Teeter" },
    { name: "BANNER_FRED_MEYER",    displayName: "Live on Fred Meyer" }
  ];

  // ---------- Scenario 1: Happy path (in progress) ----------
  const ITEM_HAPPY = {
    gtin: "00012345678905",
    supplierName: "Kraft Heinz",
    submissionId: "SUB-2026-05-12345",
    overallStatus: "IN_PROGRESS",
    currentStage: "PIM_ENRICHMENT",
    lastUpdated: "2026-05-15T14:32:00Z",
    stalledIndicator: false,
    nextAction: "No action required; item processing normally.",
    stages: [
      { name: "SUBMISSION",       status: "COMPLETED",   timestamp: "2026-05-14T09:00:00Z", details: { provider: "Salsify" } },
      { name: "KIA_VALIDATION",   status: "COMPLETED",   timestamp: "2026-05-14T10:15:00Z", details: { rulesPassed: 47 } },
      { name: "IMF_STATUS",       status: "APPROVED",    timestamp: "2026-05-14T11:00:00Z" },
      { name: "PIM_ENRICHMENT",   status: "IN_PROGRESS", timestamp: "2026-05-14T12:00:00Z" },
      { name: "PRODUCT_DOMAIN",   status: "NULL",        timestamp: null, note: "Status unavailable; awaiting PIM completion." },
      { name: "PDP_PUBLISHED",    status: "NULL",        timestamp: null },
      { name: "BANNER_HARRIS_TEETER", status: "NULL",    timestamp: null },
      { name: "BANNER_FRED_MEYER",    status: "NULL",    timestamp: null }
    ],
    banners: [
      { code: "KROGER_COM",     name: "Kroger.com",    status: "UNKNOWN", note: "Item not yet published." },
      { code: "HARRIS_TEETER",  name: "Harris Teeter", status: "UNKNOWN", note: "Item not yet published." },
      { code: "FRED_MEYER",     name: "Fred Meyer",    status: "UNKNOWN", note: "Item not yet published." }
    ],
    errors: []
  };

  // ---------- Scenario 2: Validation error (supplier-fixable) ----------
  const ITEM_ERROR = {
    gtin: "00087692000044",
    supplierName: "Boston Beer Company",
    submissionId: "SUB-2026-05-12388",
    overallStatus: "FAILED",
    currentStage: "KIA_VALIDATION",
    lastUpdated: "2026-05-15T10:16:00Z",
    stalledIndicator: false,
    nextAction: "Action needed: Update front image and resubmit.",
    stages: [
      { name: "SUBMISSION",       status: "COMPLETED", timestamp: "2026-05-15T09:55:00Z", details: { provider: "Salsify" } },
      { name: "KIA_VALIDATION",   status: "FAILED",    timestamp: "2026-05-15T10:15:00Z", note: "Image orientation invalid (1 of 47 rules failed)." },
      { name: "IMF_STATUS",       status: "NULL", timestamp: null, note: "Blocked by validation failure." },
      { name: "PIM_ENRICHMENT",   status: "NULL", timestamp: null },
      { name: "PRODUCT_DOMAIN",   status: "NULL", timestamp: null },
      { name: "PDP_PUBLISHED",    status: "NULL", timestamp: null },
      { name: "BANNER_HARRIS_TEETER", status: "NULL", timestamp: null },
      { name: "BANNER_FRED_MEYER",    status: "NULL", timestamp: null }
    ],
    banners: [
      { code: "KROGER_COM",    name: "Kroger.com",    status: "UNKNOWN", note: "Blocked upstream." },
      { code: "HARRIS_TEETER", name: "Harris Teeter", status: "UNKNOWN", note: "Blocked upstream." },
      { code: "FRED_MEYER",    name: "Fred Meyer",    status: "UNKNOWN", note: "Blocked upstream." }
    ],
    errors: [
      {
        errorCode: "KIA_VAL_IMG_ORIENTATION_INVALID",
        plainLanguageMessage: "Your front-facing product image doesn't match Kroger's specifications.",
        category: "SUPPLIER_FIXABLE",
        severity: "WARNING",
        affectedField: "images.front.orientation"
      }
    ]
  };

  // ---------- Scenario 3: Banner cache stale (partial success) ----------
  const ITEM_BANNER = {
    gtin: "00087692000825",
    supplierName: "Tillamook",
    submissionId: "SUB-2026-05-09812",
    overallStatus: "PARTIAL",
    currentStage: "BANNER_HARRIS_TEETER",
    lastUpdated: "2026-05-15T08:00:00Z",
    stalledIndicator: false,
    nextAction: "Action needed: Image not refreshing on Harris Teeter. Consider creating a support case.",
    stages: [
      { name: "SUBMISSION",       status: "COMPLETED", timestamp: "2026-05-10T09:00:00Z", details: { provider: "Syndigo" } },
      { name: "KIA_VALIDATION",   status: "COMPLETED", timestamp: "2026-05-10T10:00:00Z", details: { rulesPassed: 47 } },
      { name: "IMF_STATUS",       status: "APPROVED",  timestamp: "2026-05-10T11:00:00Z" },
      { name: "PIM_ENRICHMENT",   status: "COMPLETED", timestamp: "2026-05-10T12:30:00Z" },
      { name: "PRODUCT_DOMAIN",   status: "COMPLETED", timestamp: "2026-05-10T13:30:00Z" },
      { name: "PDP_PUBLISHED",    status: "COMPLETED", timestamp: "2026-05-10T14:00:00Z" },
      { name: "BANNER_HARRIS_TEETER", status: "FAILED", timestamp: "2026-05-10T14:05:00Z", note: "Cache not refreshed in 5 days." },
      { name: "BANNER_FRED_MEYER",    status: "COMPLETED", timestamp: "2026-05-10T14:08:00Z" }
    ],
    banners: [
      { code: "KROGER_COM",    name: "Kroger.com",    status: "LIVE",  lastPublished: "2026-05-10T14:00:00Z", pdpUrl: "https://www.kroger.com/p/00087692000825" },
      { code: "HARRIS_TEETER", name: "Harris Teeter", status: "STALE", cacheAge: "5 days", lastCacheRefresh: "2026-05-10T14:05:00Z", pdpUrl: "https://www.harristeeter.com/p/00087692000825", note: "Cache not refreshed; image may not update." },
      { code: "FRED_MEYER",    name: "Fred Meyer",    status: "LIVE",  lastPublished: "2026-05-10T14:08:00Z", pdpUrl: "https://www.fredmeyer.com/p/00087692000825" }
    ],
    errors: [
      {
        errorCode: "BANNER_CACHE_STALE_HT",
        plainLanguageMessage: "Harris Teeter's cache hasn't refreshed since publishing 5 days ago.",
        category: "REQUIRES_DIAGNOSIS",
        severity: "WARNING",
        affectedField: "banners.harris_teeter.cache"
      }
    ]
  };

  const ITEMS = {
    HAPPY:  ITEM_HAPPY,
    ERROR:  ITEM_ERROR,
    BANNER: ITEM_BANNER
  };

  // Lookup-by-GTIN — used by case-creation form to fetch context
  const ITEMS_BY_GTIN = {
    "00012345678905": { scenarioKey: "HAPPY",  ...ITEM_HAPPY },
    "00087692000044": { scenarioKey: "ERROR",  ...ITEM_ERROR },
    "00087692000825": { scenarioKey: "BANNER", ...ITEM_BANNER }
  };

  // ---------- Recent items list (dashboard table) ----------
  // Summary rows for the supplier dashboard. Three rows resolve
  // to full scenarios above; the rest are listing-only.
  const RECENT_ITEMS = [
    { gtin: "00012345678905", supplierName: "Kraft Heinz",       currentStage: "PIM Enrichment",        overallStatus: "IN_PROGRESS", lastUpdated: "2026-05-15T14:32:00Z", stalled: false, scenarioKey: "HAPPY" },
    { gtin: "00087692000044", supplierName: "Boston Beer Co.",   currentStage: "KIA Validation",        overallStatus: "FAILED",      lastUpdated: "2026-05-15T10:16:00Z", stalled: false, scenarioKey: "ERROR" },
    { gtin: "00087692000825", supplierName: "Tillamook",         currentStage: "Live on Banners",       overallStatus: "PARTIAL",     lastUpdated: "2026-05-15T08:00:00Z", stalled: false, scenarioKey: "BANNER" },
    { gtin: "00074682019345", supplierName: "Mondelez",          currentStage: "Live on Banners",       overallStatus: "COMPLETED",   lastUpdated: "2026-05-14T16:42:00Z", stalled: false },
    { gtin: "00016000189812", supplierName: "General Mills",     currentStage: "PIM Enrichment",        overallStatus: "IN_PROGRESS", lastUpdated: "2026-05-12T03:11:00Z", stalled: true  }, // >48h
    { gtin: "00012000182501", supplierName: "PepsiCo",           currentStage: "Live on Banners",       overallStatus: "COMPLETED",   lastUpdated: "2026-05-14T11:25:00Z", stalled: false },
    { gtin: "00049000031027", supplierName: "Coca-Cola",         currentStage: "Web Publishing",        overallStatus: "IN_PROGRESS", lastUpdated: "2026-05-15T13:00:00Z", stalled: false },
    { gtin: "00034000403295", supplierName: "Hershey",           currentStage: "KIA Validation",        overallStatus: "FAILED",      lastUpdated: "2026-05-15T07:48:00Z", stalled: false },
    { gtin: "00028400090050", supplierName: "Frito-Lay",         currentStage: "Live on Banners",       overallStatus: "COMPLETED",   lastUpdated: "2026-05-13T22:14:00Z", stalled: false },
    { gtin: "00041500004105", supplierName: "ConAgra",           currentStage: "Master Data Enrichment",overallStatus: "IN_PROGRESS", lastUpdated: "2026-05-15T11:50:00Z", stalled: false }
  ];

  // ---------- Profile (used as default contact info on case form) ----------
  const SUPPLIER_PROFILE = {
    name: "John Smith",
    email: "john.smith@krafheinz.com",
    phone: "+1 (513) 555-0142",
    company: "Kraft Heinz"
  };

  // ---------- Error taxonomy entries (full guidance) ----------
  const ERRORS = {
    KIA_VAL_IMG_ORIENTATION_INVALID: {
      errorCode: "KIA_VAL_IMG_ORIENTATION_INVALID",
      technicalMessage: "ImageOrientation: FRONT [Invalid Value]",
      plainLanguageMessage: "Your front-facing product image doesn't match Kroger's technical specifications.",
      category: "SUPPLIER_FIXABLE",
      categoryLabel: "You can fix this",
      severity: "WARNING",
      icon: "⚠️",
      fixGuidance: {
        summary: "Update your front image to meet Kroger's requirements and resubmit.",
        steps: [
          "Log into your data provider (Salsify, Syndigo, or GS1).",
          "Navigate to item GTIN 00087692000044.",
          "Update the front image: JPG or PNG, minimum 1000×1000px, white background.",
          "Save changes and resubmit to Kroger."
        ],
        requirements: {
          "Format": "JPG or PNG",
          "Min resolution": "1000 × 1000 px",
          "Background": "White or transparent",
          "Orientation": "Front-facing product only"
        }
      },
      knowledgeBaseLink: "https://kia-support.kroger.com/kb/image-specifications",
      affectedField: "images.front.orientation"
    },
    BANNER_CACHE_STALE_HT: {
      errorCode: "BANNER_CACHE_STALE_HT",
      technicalMessage: "HarrisTeeterCDN: cache_age=5d, last_invalidation_failed=true",
      plainLanguageMessage: "Harris Teeter's cache hasn't refreshed since the item was published.",
      category: "REQUIRES_DIAGNOSIS",
      categoryLabel: "Requires diagnosis",
      severity: "WARNING",
      icon: "⚠️",
      fixGuidance: {
        summary: "This is a known Harris Teeter caching issue. Create a support case so Banner IT can manually invalidate the cache.",
        steps: [
          "Confirm the item is live on Kroger.com (it is).",
          "Click 'Create Support Case' on this page.",
          "Banner IT will request manual cache invalidation.",
          "You'll be asked to verify within 24–48 hours."
        ],
        requirements: {
          "Owner": "Kroger Banner IT",
          "Typical SLA": "48 hours",
          "Action": "Manual cache invalidation"
        }
      },
      knowledgeBaseLink: "https://kia-support.kroger.com/kb/banner-cache",
      affectedField: "banners.harris_teeter.cache"
    }
  };

  // ---------- Diagnostic logs (agent view) ----------
  const DIAGNOSTIC_LOGS = {
    "00087692000825": {
      caseId: "CASE-2026-05-0001",
      issueType: "IMAGE_NOT_UPDATING",
      ownershipSuggestion: "BANNER_IT",
      ownershipReason: "Harris Teeter cache invalidation has failed for 5 days; image was correctly published upstream. Pattern matches known cache issue (3+ similar tickets in 90 days).",
      recommendedAction: "Request Harris Teeter cache invalidation",
      logs: {
        SUBMISSION: [
          { time: "09:00:15", level: "info", text: "Payload received from Syndigo" },
          { time: "09:00:15", level: "info", text: "Payload size: 2.1 MB" },
          { time: "09:00:18", level: "pass", text: "Attribute count: 47/47" }
        ],
        KIA_VALIDATION: [
          { time: "10:00:00", level: "info", text: "Validation started" },
          { time: "10:00:04", level: "pass", text: "Image orientation check: PASS" },
          { time: "10:00:08", level: "pass", text: "Nutrition facts check: PASS" },
          { time: "10:00:12", level: "pass", text: "Marketing copy check: PASS" },
          { time: "10:00:30", level: "pass", text: "Validation completed (47/47 rules passed)" }
        ],
        IMF_STATUS: [
          { time: "11:00:00", level: "info", text: "IMF record created: IMF-882-19283" },
          { time: "11:00:02", level: "pass", text: "Status set to APPROVED" }
        ],
        PIM_ENRICHMENT: [
          { time: "12:00:00", level: "info", text: "Enrichment started" },
          { time: "12:18:45", level: "info", text: "Dimensions derived from case pack data" },
          { time: "12:25:11", level: "info", text: "Weight calculated from net content" },
          { time: "12:30:02", level: "pass", text: "Enrichment complete; published to downstream" }
        ],
        PRODUCT_DOMAIN: [
          { time: "13:30:00", level: "info", text: "Web aggregation started" },
          { time: "13:30:14", level: "pass", text: "Aggregation complete; record id WEB-77182" }
        ],
        PDP_PUBLISHED: [
          { time: "14:00:00", level: "info", text: "PDP publish job started" },
          { time: "14:00:08", level: "pass", text: "PDP live on Kroger.com" }
        ],
        BANNER_HARRIS_TEETER: [
          { time: "14:05:00", level: "info", text: "Cache invalidation request sent to Harris Teeter CDN" },
          { time: "14:05:30", level: "fail", text: "Cache invalidation: NO_ACK from CDN endpoint" },
          { time: "14:10:00", level: "fail", text: "Retry 1: NO_ACK" },
          { time: "14:30:00", level: "fail", text: "Retry 2: NO_ACK" },
          { time: "15:00:00", level: "fail", text: "Retry 3 (final): NO_ACK; manual intervention required" },
          { time: "5 days ago", level: "info", text: "Cache age: 5 days; last successful invalidation 2026-05-08" }
        ],
        BANNER_FRED_MEYER: [
          { time: "14:08:00", level: "info", text: "Cache invalidation request sent to Fred Meyer CDN" },
          { time: "14:08:04", level: "pass", text: "Cache invalidation: ACK" },
          { time: "14:08:14", level: "pass", text: "Item live on Fred Meyer" }
        ]
      },
      auditTrail: [
        { time: "2026-05-15T09:00:00Z", actor: "Tillamook (supplier)", action: "Created support case <b>CASE-2026-05-0001</b>" },
        { time: "2026-05-15T09:00:01Z", actor: "System (auto-routing)", action: "Routed to <b>Banner IT</b> based on issue category" },
        { time: "2026-05-15T09:01:00Z", actor: "System (chronic-detector)", action: "Flagged: 3rd Harris Teeter cache ticket from this supplier in 90 days" },
        { time: "2026-05-15T09:32:00Z", actor: "Agent: J. Patel", action: "Opened diagnostic view" }
      ]
    }
  };

  // ---------- Banner health summary (sidebar / dashboard) ----------
  const BANNER_HEALTH = [
    {
      code: "KROGER_COM", name: "Kroger.com", status: "HEALTHY",
      avgCacheAge: "< 1 hour", staleItems: 0, recentFailures: 1
    },
    {
      code: "HARRIS_TEETER", name: "Harris Teeter", status: "DEGRADED",
      avgCacheAge: "4.2 days", staleItems: 127, recentFailures: 15,
      flag: "Chronic cache invalidation failures detected (15 incidents in 7 days)."
    },
    {
      code: "FRED_MEYER", name: "Fred Meyer", status: "HEALTHY",
      avgCacheAge: "< 1 hour", staleItems: 2, recentFailures: 0
    }
  ];

  return { STAGES, ITEMS, ITEMS_BY_GTIN, RECENT_ITEMS, SUPPLIER_PROFILE, ERRORS, DIAGNOSTIC_LOGS, BANNER_HEALTH };
})();
