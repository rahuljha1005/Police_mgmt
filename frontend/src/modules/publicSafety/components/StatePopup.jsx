const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const StatePopup = (state) => `
  <div style="min-width: 190px">
    <strong>${state?.state || "Unmapped State"}</strong><br />
    Safety Score: ${state?.safetyScore ?? "-"} / 100<br />
    Risk Category: ${state?.safetyCategory || "Not monitored"}<br />
    Crime Growth: ${state?.growthPercent ?? "-"}%<br />
    Common Crime: ${state?.commonCrimeType || "-"}<br />
    Resolution: ${state?.complaintResolutionPercent ?? "-"}%<br />
    Annual Incidents: ${formatNumber(state?.yearlyCrimeCount)}
  </div>
`;

export default StatePopup;
