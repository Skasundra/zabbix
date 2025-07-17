const axios = require("axios");

const sendAlertMail = async ({ email, alertData, baseUrl }) => {
  try {
    const results = [];
    const { MAIL_API_URL, MAIL_API_TOKEN, MAIL_API_SITE_ID, SMTP_SENDER_NAME } =
      process.env;

    if (
      !MAIL_API_URL ||
      !MAIL_API_TOKEN ||
      !MAIL_API_SITE_ID ||
      !SMTP_SENDER_NAME
    ) {
      console.error("sendAlertMail - Missing SMTP configuration");
      return [
        {
          status: "FAILURE",
          error: "Missing SMTP configuration in environment variables",
        },
      ];
    }

    const sendAlertTemplate = (alertData, baseUrl) => {
      console.log("alertData=------------------>", alertData);

      // Get severity color based on severity level
      const getSeverityColor = (severity) => {
        const colors = {
          0: "#10b981", // Not classified - green
          1: "#3b82f6", // Information - blue
          2: "#f59e0b", // Warning - yellow
          3: "#f97316", // Average - orange
          4: "#ef4444", // High - red
          5: "#dc2626", // Disaster - dark red
        };
        return colors[severity] || "#6b7280";
      };

      const severityColor = getSeverityColor(alertData.severity);
      const isProblem = alertData.value === "1";
      const statusColor = isProblem ? "#ef4444" : "#10b981";
      const statusIcon = isProblem ? "⚠️" : "✅";

      return `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zabbix Alert - ${alertData.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(145deg, #6b7280 0%, #4b5563 100%);
      padding: 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1.6;
    }

    .email-container {
      max-width: 960px;
      width: 100%;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .header {
      background: linear-gradient(145deg, #1e40af 0%, #1e3a8a 100%);
      color: white;
      padding: 32px;
      text-align: center;
      position: relative;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.2;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .header p {
      font-size: 16px;
      opacity: 0.9;
    }

    .status-banner {
      background: ${statusColor};
      color: white;
      padding: 16px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
    }

    .status-content {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .status-icon {
      font-size: 24px;
    }

    .content {
      padding: 32px;
    }

    table.alert-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      background: #f9fafb;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    table.alert-table th,
    table.alert-table td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    table.alert-table th {
      background: ${severityColor};
      color: white;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
    }

    table.alert-table td {
      font-size: 15px;
      color: #374151;
    }

    .severity-badge {
      display: inline-block;
      background: ${severityColor};
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .mono {
      font-family: 'JetBrains Mono', 'Monaco', monospace;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-block;
    }

    .host-info td {
      background: #fefce8;
      border-left: 4px solid #eab308;
    }

    .event-info td {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
    }

    .tag {
      background: #e5e7eb;
      color: #4b5563;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .actions {
      text-align: center;
      padding: 24px;
      background: #f0f9ff;
      border-radius: 12px;
      margin-top: 24px;
    }

    .action-button {
      display: inline-block;
      background: linear-gradient(145deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      margin: 8px;
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
    }

    .footer {
      background: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }

    .timestamp {
      font-size: 12px;
      color: #9ca3af;
    }

    @media (max-width: 768px) {
      body {
        padding: 12px;
      }

      .email-container {
        border-radius: 12px;
      }

      .header {
        padding: 24px;
      }

      .header h1 {
        font-size: 28px;
      }

      .content {
        padding: 24px;
      }

      table.alert-table th,
      table.alert-table td {
        padding: 12px;
        font-size: 14px;
      }

      .action-button {
        display: block;
        margin: 8px 0;
        padding: 12px;
      }
    }

    @media (max-width: 480px) {
      .header h1 {
        font-size: 24px;
      }

      .status-banner {
        font-size: 16px;
      }

      .status-icon {
        font-size: 20px;
      }

      table.alert-table th,
      table.alert-table td {
        font-size: 13px;
        padding: 10px;
      }

      .severity-badge {
        font-size: 11px;
        padding: 3px 10px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🛡️ Cyber Central</h1>
      <p>System Monitoring & Alert Notification</p>
    </div>

    <div class="status-banner">
      <div class="status-content">
        <span class="status-icon">${statusIcon}</span>
        <span>Alert Status: ${alertData.status}</span>
      </div>
    </div>

    <div class="content">
      <table class="alert-table">
        <tr>
          <th colspan="2">Alert Summary</th>
        </tr>
        <tr>
          <td><strong>Alert Name</strong></td>
          <td>${alertData.name} <span class="severity-badge">${
        alertData.severity_name
      }</span></td>
        </tr>
        <tr>
          <td><strong>Description</strong></td>
          <td>This alert was triggered on <strong>${
            alertData.host.host
          }</strong> and requires your attention.</td>
        </tr>
      </table>

      <table class="alert-table">
        <tr>
          <th colspan="2">Alert Details</th>
        </tr>
        <tr>
          <td><strong>Event ID</strong></td>
          <td class="mono">${alertData.eventid}</td>
        </tr>
        <tr>
          <td><strong>Trigger ID</strong></td>
          <td class="mono">${alertData.objectid}</td>
        </tr>
        <tr>
          <td><strong>Timestamp</strong></td>
          <td>${alertData.readable_time}</td>
        </tr>
        <tr>
          <td><strong>Time Since</strong></td>
          <td>${alertData.time_ago}</td>
        </tr>
        <tr>
          <td><strong>Acknowledged</strong></td>
          <td>${alertData.acknowledged === "1" ? "✅ Yes" : "❌ No"}</td>
        </tr>
        <tr>
          <td><strong>Value</strong></td>
          <td>${alertData.value == "1" ? "PROBLEM" : "OK"}</td>
        </tr>
      </table>

      <table class="alert-table host-info">
        <tr>
          <th colspan="2">Host Information</th>
        </tr>
        <tr>
          <td><strong>Host</strong></td>
          <td>
            <strong>${alertData.host.host}</strong><br>
            IP: ${alertData.host.interfaces[0]?.ip || "N/A"}<br>
            Host ID: ${alertData.host.hostid}
          </td>
        </tr>
      </table>

      <table class="alert-table event-info">
        <tr>
          <th colspan="2">Event Details</th>
        </tr>
        <tr>
          <td><strong>Event</strong></td>
          <td>
            ${alertData.name}
            ${
              alertData.tags && alertData.tags.length > 0
                ? `
            <div class="tags">
              ${alertData.tags
                .map(
                  (tag) => `<span class="tag">${tag.tag}: ${tag.value}</span>`
                )
                .join("")}
            </div>
          `
                : ""
            }
          </td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p><strong>Cyber Central Monitoring System</strong></p>
      <p>This is an automated alert notification</p>
      <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;
    };

    for (const toEmail of email) {
      const emailParams = {
        EmailTo: toEmail,
        Subject: `Cyber Central Alert for ${alertData.host.name}`,
        Message: sendAlertTemplate(alertData, baseUrl),
        ReplyToEmail: "",
        RelpyToName: SMTP_SENDER_NAME,
        CcEmail: "",
        BccEmail: "",
        AllowAttachment: "png,PNG,pdf,PDF,xls,xlsx,csv,jpg",
        Attachment: [],
      };

      const returnObject = {
        EmailPara: JSON.stringify(emailParams),
        SiteId: MAIL_API_SITE_ID,
        SiteTocken: MAIL_API_TOKEN,
      };

      const headers = {
        Authorization:
          "Basic VjlhVmJ1TXFhVzFCL2svNWZYb09uL0Vkd0NkdGZ4ZVFETU4vRUxzd1RDZz06Q2x1ZXMkUUo0aHduTg==",
      };

      try {
        const response = await axios.post(MAIL_API_URL, returnObject, {
          headers,
        });
        const status = response.data === 1 ? "SUCCESS" : "FAILURE";
        results.push({
          status,
          toEmail,
          //   template: emailParams.Message,
          //   attachments: null,
        });
      } catch (error) {
        console.error(`Error sending email to ${toEmail}:`, error.message);
        results.push({
          status: "FAILURE",
          toEmail,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("sendAlertMail error:", error.message);
    return [
      {
        status: "FAILURE",
        error: error.message,
      },
    ];
  }
};

module.exports = { sendAlertMail };
