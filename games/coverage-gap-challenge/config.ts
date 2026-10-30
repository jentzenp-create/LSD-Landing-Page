// Shared constants for Coverage Gap Challenge.

// Paste the GoHighLevel "Inbound Webhook" URL here once the workflow exists
// (Automation > Workflows > trigger "Inbound Webhook"). Leads are sent to it
// when a player submits the email form. Empty = leads are only logged.
export const GHL_WEBHOOK_URL = '';

export const IN_IFRAME = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const params = new URLSearchParams(window.location.search);
// ?src=<tag> is sent with the lead so you know where the play came from.
export const SOURCE = params.get('src') || (IN_IFRAME ? 'embed' : 'web');
