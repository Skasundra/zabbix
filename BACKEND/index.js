require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { sendAlertMail } = require("./nodeMailer");
const cron = require("node-cron");
const { getTimeRange } = require("./common");
const app = express();
const PORT = process.env.PORT || 9000;
const ZABBIX_API_URL = process.env.ZABBIX_API_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Centralized axios instance for Zabbix API
// const zabbixApi = axios.create({
//   baseURL: ZABBIX_API_URL,
//   headers: { "Content-Type": "application/json" },
//   timeout: 80000, // Set timeout to 30 seconds
// });



// Centralized axios instance for Zabbix API with improved configuration
const zabbixApi = axios.create({
  baseURL: process.env.ZABBIX_API_URL,
  headers: { 
    "Content-Type": "application/json",
    "Connection": "close" // Force connection close to prevent keep-alive issues
  },
  timeout: 30000, // Reduced timeout to 30 seconds
  maxRedirects: 5,
  // Disable HTTP keep-alive to prevent connection reuse issues
  httpAgent: new (require('http').Agent)({ 
    keepAlive: false,
    maxSockets: 10 
  }),
  // Add retry configuration
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  }
});

// Helper function to calculate time ago
function getTimeAgo(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - parseInt(timestamp);

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// Severity mapping based on provided table
const SEVERITY_LEVELS = {
  0: { name: "Not classified", color: "Gray" },
  1: { name: "Information", color: "Light Blue" },
  2: { name: "Warning", color: "Yellow" },
  3: { name: "Average", color: "Orange" },
  4: { name: "High", color: "Red" },
  5: { name: "Disaster", color: "Dark Red" },
};

// Error handling middleware
const errorHandler = (res, error) => {
  console.error("API Error:", error);
  res.status(500).json({ error: error.response?.data || error.message });
};

// Zabbix API authentication
const loginToZabbix = async () => {
  try {
    const response = await zabbixApi.post("", {
      jsonrpc: "2.0",
      method: "user.login",
      params: {
        username: process.env.ZABBIX_API_USER,
        password: process.env.ZABBIX_API_PASSWORD,
      },
      id: 1,
    });
    return response.data.result;
  } catch (error) {
    throw new Error("Failed to authenticate with Zabbix API");
  }
};

// Generic API request handler
const makeZabbixRequest = async (authToken, method, params) => {
  const response = await zabbixApi.post(
    "",
    {
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  // console.log("trophy-pushing army---------->",response)
  return response.data.result;
};

// Route handler wrapper
const apiRoute = (fn) => async (req, res) => {
  try {
    const authToken = await loginToZabbix();
    const result = await fn(authToken, req);
    res.status(200).json(result);
  } catch (error) {
    errorHandler(res, error);
  }
};

// API Routes
app.post(
  "/api/zabbix/hosts",
  apiRoute(async (authToken, req) =>
    makeZabbixRequest(authToken, "host.get", req.body || {})
  )
);

app.post(
  "/api/zabbix/cpu-load",
  apiRoute(async (authToken, req) =>
    makeZabbixRequest(authToken, "item.get", {
      output: ["itemid", "name", "lastvalue"],
      search: { key_: "system.cpu.load" },
      hostids: req.body.hostid,
      sortfield: "name",
    })
  )
);

app.post(
  "/api/zabbix/uptime",
  apiRoute(async (authToken, req) =>
    makeZabbixRequest(authToken, "item.get", {
      output: ["itemid", "name", "lastvalue"],
      search: { key_: "system.uptime" },
      hostids: req.body.hostid,
      sortfield: "name",
    })
  )
);

app.post(
  "/api/zabbix/alerts",
  apiRoute(async (authToken, req) =>
    makeZabbixRequest(authToken, "trigger.get", {
      output: ["triggerid", "description", "priority", "lastchange"],
      hostids: req.body.hostid,
      filter: { value: 1 },
      expandDescription: true,
      sortfield: "priority",
      sortorder: "DESC",
    })
  )
);

app.post(
  "/api/zabbix/active-triggers",
  apiRoute(async (authToken, req) =>
    makeZabbixRequest(authToken, "trigger.get", {
      output: [
        "triggerid",
        "description",
        "priority",
        "lastchange",
        "expression",
      ],
      selectDependencies: "extend",
      skipDependent: true,
      hostids: req.body.hostid,
      filter: { value: 1, status: 0 },
      expandDescription: true,
      sortfield: "priority",
      sortorder: "DESC",
    })
  )
);

app.post(
  "/api/zabbix/get-recent-events",
  apiRoute(async (authToken, req) => {
    try {
      const { triggerid, hostId } = req.body;

      const latestEvent = await makeZabbixRequest(authToken, "event.get", {
        output: [
          "eventid",
          "objectid",
          "clock",
          "ns",
          "value",
          "acknowledged",
          "name",
          "severity",
        ],
        selectTags: "extend",
        selectAcknowledges: "extend",
        objectids: [triggerid],
        sortfield: ["clock"],
        sortorder: "DESC",
        limit: 1, // Get only the latest event
      });

      console.log("Latest event raw:", latestEvent);

      const event = latestEvent[0];
      const resolvedTime = new Date(event.clock * 1000).toLocaleString();
      console.log(`✅ Problem was resolved at: ${resolvedTime}`);
      console.log(`🧾 EventID: ${event.eventid}, TriggerID: ${event.objectid}`);

      if (!latestEvent || latestEvent.length === 0) {
        return {
          success: false,
          message: `No events found for trigger ${triggerid}`,
          data: null,
        };
      }

      // 2️⃣ Get host details
      const hostDetails = await makeZabbixRequest(authToken, "host.get", {
        hostids: [hostId],
        output: ["hostid", "host", "name", "status"],
        selectInterfaces: ["ip", "dns", "useip"],
        selectGroups: ["name"],
        selectInventory: ["os", "hardware", "location"],
      });

      const host = hostDetails?.[0] || {};

      const formattedEvent = {
        ...event,
        readable_time: new Date(event.clock * 1000).toLocaleString(),
        status: event.value === "1" ? "PROBLEM" : "OK",
        time_ago: getTimeAgo(event.clock),
        is_acknowledged: event.acknowledged === "1",
        severity_name: SEVERITY_LEVELS[event.severity]?.name || "Unknown",
        severity_color: SEVERITY_LEVELS[event.severity]?.color || "Unknown",
        host,
      };

      console.log("host------------->", host);

      let email = ["tomsmith.net1@gmail.com"];
      // Send email notification if email addresses are provided
      let emailResults = null;
      if (email && Array.isArray(email) && email.length > 0) {
        emailResults = await sendAlertMail({
          email,
          alertData: formattedEvent,
          baseUrl: process.env.BASE_URL || "http://localhost:3000",
        });
        console.log("Email sending results:", emailResults);
      }

      return {
        success: true,
        data: formattedEvent,
        message: `Latest event: ${formattedEvent.status} at ${formattedEvent.readable_time}`,
      };
    } catch (error) {
      console.error("Error fetching latest event:", error.message);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  })
);

// --------------------------------------------------------------- //

// Alternative version with even better performance using Promise.all for parallel processing
app.post(
  "/api/zabbix/most-recent-event-v2",
  apiRoute(async (authToken, req) => {
    try {
      // Start timing for performance monitoring
      const startTime = Date.now();

      // 1️⃣ Get hosts and triggers in parallel
      const [hosts, allTriggers] = await Promise.all([
        makeZabbixRequest(authToken, "host.get", {
          output: ["hostid", "host", "name", "status"],
          selectInterfaces: ["ip", "dns", "useip"],
          selectGroups: ["name"],
          selectInventory: ["os", "hardware", "location"],
          filter: { status: 0 },
        }),
        makeZabbixRequest(authToken, "trigger.get", {
          output: ["triggerid", "description", "priority", "lastchange"],
          selectHosts: ["hostid", "host", "name"],
          expandDescription: true,
          filter: {
            value: 1,
            status: 0,
          },
          sortfield: ["lastchange"],
          sortorder: "DESC",
          limit: 1000,
        }),
      ]);

      if (!hosts || hosts.length === 0) {
        return {
          success: false,
          message: "No active hosts found",
          data: null,
        };
      }

      if (!allTriggers || allTriggers.length === 0) {
        return {
          success: true,
          data: null,
          message: "No active triggers found",
        };
      }

      // Create host map for quick lookup
      const hostMap = hosts.reduce((map, host) => {
        map[host.hostid] = host;
        return map;
      }, {});

      // 2️⃣ Get most recent event
      const triggerIds = allTriggers.map((trigger) => trigger.triggerid);

      const allEvents = await makeZabbixRequest(authToken, "event.get", {
        output: [
          "eventid",
          "objectid",
          "clock",
          "ns",
          "value",
          "acknowledged",
          "name",
          "severity",
        ],
        objectids: triggerIds,
        sortfield: ["clock"],
        sortorder: "DESC",
        limit: 1,
        time_from: Math.floor(Date.now() / 1000) - 24 * 60 * 60,
      });

      if (!allEvents || allEvents.length === 0) {
        return {
          success: true,
          data: null,
          message: "No recent events found",
        };
      }

      const mostRecentEvent = allEvents[0];
      const correspondingTrigger = allTriggers.find(
        (trigger) => trigger.triggerid === mostRecentEvent.objectid
      );

      if (!correspondingTrigger) {
        return {
          success: false,
          message: "Could not find corresponding trigger",
          data: null,
        };
      }

      const triggerHost = correspondingTrigger.hosts[0];
      const hostDetails = hostMap[triggerHost.hostid];

      // 3️⃣ Format event
      const formattedEvent = {
        ...mostRecentEvent,
        trigger_description: correspondingTrigger.description,
        readable_time: new Date(mostRecentEvent.clock * 1000).toLocaleString(),
        status: mostRecentEvent.value === "1" ? "PROBLEM" : "OK",
        time_ago: getTimeAgo(mostRecentEvent.clock),
        is_acknowledged: mostRecentEvent.acknowledged === "1",
        severity_name:
          SEVERITY_LEVELS[mostRecentEvent.severity]?.name || "Unknown",
        severity_color:
          SEVERITY_LEVELS[mostRecentEvent.severity]?.color || "Unknown",
        host: { ...hostDetails, ...triggerHost },
      };

      // 4️⃣ Send email asynchronously
      const emailRecipients = ["tomsmith.net1@gmail.com"];
      let emailPromise = null;

      if (emailRecipients?.length > 0) {
        emailPromise = sendAlertMail({
          email: emailRecipients,
          alertData: formattedEvent,
          baseUrl: process.env.BASE_URL || "http://localhost:3000",
        }).catch((error) => {
          console.error("Email sending failed:", error);
          return { success: false, error: error.message };
        });
      }

      const processingTime = Date.now() - startTime;
      console.log(`Processing completed in ${processingTime}ms`);

      const response = {
        success: true,
        data: formattedEvent,
        emailSent: !!emailPromise,
        processingTime: `${processingTime}ms`,
        message: `Most recent event: ${formattedEvent.status} at ${formattedEvent.readable_time}`,
      };

      // Log email results asynchronously
      if (emailPromise) {
        emailPromise.then((emailResults) => {
          console.log("Email sending results:", emailResults);
        });
      }

      return response;
    } catch (error) {
      console.error("Error in most-recent-event-v2:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  })
);

// ------------------------------new cron--------------------------------- //
// // Cron for check event with 2-minute gap
const sentEvents = new Map();

// Cleanup interval for sent events (remove events older than 1 hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const EVENT_EXPIRY = 60 * 60; // 1 hour in seconds

// Cleanup old sent events periodically
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [eventId, timestamp] of sentEvents) {
    if (now - timestamp > EVENT_EXPIRY) {
      sentEvents.delete(eventId);
    }
  }
}, CLEANUP_INTERVAL);

// Function to check if event was already sent
function isEventAlreadySent(eventId) {
  return sentEvents.has(eventId);
}

// Function to mark event as sent
function markEventAsSent(eventId) {
  const timestamp = Math.floor(Date.now() / 1000);
  sentEvents.set(eventId, timestamp);
}

// Cron for check event with 2-minute gap
async function checkZabbixRecentEvent() {
  try {
    const authToken = await loginToZabbix();
    if (!authToken) throw new Error("Unable to retrieve Zabbix auth token");

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const currentMinute = currentTimestamp - (currentTimestamp % 60);

    // Check for events in the last 2 minutes (120 seconds before current minute)
    const startTime = currentMinute - 120; // 2 minutes ago
    const endTime = currentMinute; // Current minute start

    console.log(
      `🔍 Checking events from ${new Date(
        startTime * 1000
      ).toLocaleString()} to ${new Date(endTime * 1000).toLocaleString()}`
    );

    const [hosts, allTriggers] = await Promise.all([
      makeZabbixRequest(authToken, "host.get", {
        output: ["hostid", "host", "name", "status"],
        selectInterfaces: ["ip", "dns", "useip"],
        selectGroups: ["name"],
        selectInventory: ["os", "hardware", "location"],
        filter: { status: 0 },
      }),
      makeZabbixRequest(authToken, "trigger.get", {
        output: ["triggerid", "description", "priority", "lastchange"],
        selectHosts: ["hostid", "host", "name"],
        expandDescription: true,
        filter: {
          value: 1,
          status: 0,
        },
        sortfield: ["lastchange"],
        sortorder: "DESC",
        limit: 1000,
      }),
    ]);

    if (!hosts?.length || !allTriggers?.length) {
      console.log("No hosts or triggers found");
      return;
    }

    const hostMap = hosts.reduce((map, host) => {
      map[host.hostid] = host;
      return map;
    }, {});

    const triggerIds = allTriggers.map((trigger) => trigger.triggerid);

    // Get events from the last 2 minutes
    const recentEvents = await makeZabbixRequest(authToken, "event.get", {
      output: [
        "eventid",
        "objectid",
        "clock",
        "ns",
        "value",
        "acknowledged",
        "name",
        "severity",
      ],
      objectids: triggerIds,
      sortfield: ["clock"],
      sortorder: "DESC",
      limit: 50, // Increased limit to catch more events in 2-minute window
      time_from: startTime,
      time_till: endTime,
    });

    if (!recentEvents?.length) {
      console.log(
        `📭 No new events found between ${new Date(
          startTime * 1000
        ).toLocaleString()} and ${new Date(endTime * 1000).toLocaleString()}`
      );
      return;
    }

    console.log(
      `📨 Found ${recentEvents.length} event(s) in the last 2 minutes`
    );

    // Filter out already sent events
    const newEvents = recentEvents.filter(
      (event) => !isEventAlreadySent(event.eventid)
    );

    if (newEvents.length === 0) {
      console.log("📌 All events were already sent, skipping notifications");
      return;
    }

    console.log(
      `📬 ${newEvents.length} new event(s) to process after duplicate filtering`
    );

    // Process each new event
    const processedEvents = [];

    for (const event of newEvents) {
      const correspondingTrigger = allTriggers.find(
        (t) => t.triggerid === event.objectid
      );

      if (!correspondingTrigger) continue;

      const triggerHost = correspondingTrigger.hosts[0];
      const hostDetails = hostMap[triggerHost.hostid];

      const formattedEvent = {
        ...event,
        trigger_description: correspondingTrigger.description,
        readable_time: new Date(event.clock * 1000).toLocaleString(),
        status: event.value === "1" ? "PROBLEM" : "OK",
        time_ago: getTimeAgo(event.clock),
        is_acknowledged: event.acknowledged === "1",
        severity_name: SEVERITY_LEVELS[event.severity]?.name || "Unknown",
        severity_color: SEVERITY_LEVELS[event.severity]?.color || "Unknown",
        host: { ...hostDetails, ...triggerHost },
      };

      processedEvents.push(formattedEvent);
    }

    if (processedEvents.length === 0) {
      console.log("No valid events to process");
      return;
    }

    // Send email for each new event
    const emailRecipients = ["tomsmith.net1@gmail.com"];

    for (const eventData of processedEvents) {
      try {
        const emailResult = await sendAlertMail({
          email: emailRecipients,
          alertData: eventData,
          baseUrl: process.env.BASE_URL || "http://localhost:3000",
        });

        // Mark event as sent only after successful email send
        markEventAsSent(eventData.eventid);
        console.log(
          `📧 Alert sent for event ${eventData.eventid}:`,
          emailResult
        );
      } catch (emailError) {
        console.error(
          `❌ Failed to send email for event ${eventData.eventid}:`,
          emailError.message
        );
        // Don't mark as sent if email failed, so it can be retried
      }
    }

    // Optional: Log current sent events count for monitoring
    console.log(`📊 Currently tracking ${sentEvents.size} sent events`);
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }7
}

// Run every minute
// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Running Zabbix event cron job...");
//   await checkZabbixRecentEvent();
// });

// ------------------------------new cron--------------------------------- //

app.post(
  "/api/zabbix/problems",
  apiRoute(async (authToken, req) =>
    makeZabbixRequest(authToken, "problem.get", {
      output: "extend",
      selectAcknowledges: "extend",
      selectTags: "extend",
      selectSuppressionData: "extend",
      objectids: req.body.hostid,
      recent: true,
      sortfield: ["eventid"],
      sortorder: "DESC",
    })
  )
);

app.post(
  "/api/zabbix/trigger/create",
  apiRoute(async (authToken, req) => {
    const { hostid, description, expression, priority = 2 } = req.body;
    if (!hostid || !description || !expression) {
      throw new Error(
        "Missing required fields: hostid, description, or expression"
      );
    }
    return makeZabbixRequest(authToken, "trigger.create", {
      description,
      expression,
      priority,
      status: 0,
      type: 0,
    });
  })
);

app.post(
  "/api/zabbix/trigger/update",
  apiRoute(async (authToken, req) => {
    const { triggerid, status } = req.body;
    if (!triggerid || status === undefined) {
      throw new Error("Missing required fields: triggerid or status");
    }
    return makeZabbixRequest(authToken, "trigger.update", {
      triggerid,
      status,
    });
  })
);

// Endpoint for Latest CPU utilization
app.post(
  "/api/zabbix/cpu-load-latest",
  apiRoute(async (authToken, req) => {
    const { hostid } = req.body;
    if (!hostid) {
      throw new Error("Missing required field: hostid");
    }

    // Step 1: Get itemid for system.cpu.load[percpu,avg1]
    const items = await makeZabbixRequest(authToken, "item.get", {
      output: ["itemid", "name", "lastvalue"],
      hostids: hostid,
      search: { key_: "system.cpu.load" },
      sortfield: "name",
    });

    if (!items || items.length === 0) {
      throw new Error("No CPU load item found for the specified host");
    }

    const itemid = items[0].itemid;

    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
    const timeFrom = currentTime - 60; // last 1 minute

    // Step 2: Get CPU load data from last 1 minute
    return makeZabbixRequest(authToken, "history.get", {
      output: "extend",
      itemids: [itemid],
      history: 0, // Numeric float
      // time_from: timeFrom,
      // time_till: currentTime,
      limit: 10, // adjust if needed
      sortfield: "clock",
      sortorder: "DESC",
    });
  })
);

// Endpoint for latest memory utilization
app.post(
  "/api/zabbix/memory-utilization-latest",
  apiRoute(async (authToken, req) => {
    const { hostid } = req.body;
    if (!hostid) {
      throw new Error("Missing required field: hostid");
    }
    const items = await makeZabbixRequest(authToken, "item.get", {
      output: ["itemid"],
      hostids: hostid,
      search: { key_: "vm.memory.size[pavailable]" },
    });
    if (!items || items.length === 0) {
      throw new Error(
        "No memory utilization item found for the specified host"
      );
    }
    const itemid = items[0].itemid;
    const currentTime = Math.floor(Date.now() / 1000);
    return makeZabbixRequest(authToken, "history.get", {
      output: "extend",
      itemids: [itemid],
      history: 0, // Float data type for memory utilization
      // time_from: currentTime - 60, // 60-second window
      // time_till: currentTime,
      limit: 10,
      sortfield: "clock",
      sortorder: "DESC",
    });
  })
);

// Endpoint for latest disk utilization
app.post(
  "/api/zabbix/disk-utilization-latest",
  apiRoute(async (authToken, req) => {
    const { hostid } = req.body;

    if (!hostid) {
      throw new Error("Missing required field: hostid");
    }
    const items = await makeZabbixRequest(authToken, "item.get", {
      output: "extend",
      hostids: hostid,
      search: { key_: "vfs.fs.dependent.size[/,pused]" },
    });

    if (!items || items.length === 0) {
      return [];
    }
    const itemid = items[0].itemid;
    const currentTime = Math.floor(Date.now() / 1000);
    return makeZabbixRequest(authToken, "history.get", {
      output: "extend",
      itemids: [itemid],
      history: 0, // Float data type for disk utilization
      // // time_from: currentTime - 60, // 60-second window
      // // time_till: currentTime,
      limit: 10,
      sortfield: "clock",
      sortorder: "DESC",
    });
  })
);

// -------------------------------------------------------------------------------------------------------------/

// Function to convert Unix timestamp to human-readable format
// backend/index.js
const formatTimestamp = (unixTimestamp) => {
  return new Date(unixTimestamp * 1000).toISOString();
};

// Function to filter data to get 24 points per day (hourly data)
const filterHourlyData = (data, startTime, endTime) => {
  if (!data || data.length === 0) return [];

  const result = [];
  const startDate = new Date(startTime * 1000);
  const endDate = new Date(endTime * 1000);

  // Calculate total days
  const totalDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));

  // For each day, get 24 data points (one per hour)
  for (let day = 0; day < totalDays; day++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(startDate.getDate() + day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // Get data for this day
    const dayData = data.filter((item) => {
      const itemTime = new Date(item.clock);
      return itemTime >= dayStart && itemTime <= dayEnd;
    });

    if (dayData.length === 0) continue;

    // If we have data for this day, select 24 points (one per hour)
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(dayStart);
      hourStart.setHours(hour, 0, 0, 0);

      const hourEnd = new Date(dayStart);
      hourEnd.setHours(hour, 59, 59, 999);

      // Find the closest data point to this hour
      const hourData = dayData.filter((item) => {
        const itemTime = new Date(item.clock);
        return itemTime >= hourStart && itemTime <= hourEnd;
      });

      if (hourData.length > 0) {
        // Take the first data point of this hour
        result.push(hourData[0]);
      } else {
        // If no data for this hour, find the closest data point
        const closestData = dayData.reduce((closest, current) => {
          const currentTime = new Date(current.clock);
          const closestTime = new Date(closest.clock);
          const targetTime = new Date(hourStart);
          targetTime.setMinutes(30); // Target middle of the hour

          return Math.abs(currentTime - targetTime) <
            Math.abs(closestTime - targetTime)
            ? current
            : closest;
        });

        if (
          closestData &&
          !result.find((item) => item.clock === closestData.clock)
        ) {
          result.push(closestData);
        }
      }
    }
  }

  // Sort by timestamp and return only unique entries
  return result
    .filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.clock === item.clock)
    )
    .sort((a, b) => new Date(b.clock) - new Date(a.clock))
    .slice(0, totalDays * 24);
};

// Modified endpoint to handle both filtered and latest data
app.post(
  "/api/zabbix/all-utilizations-v2",
  apiRoute(async (authToken, req) => {
    const { startDate, endDate, filterStatus } = req.body;

    console.log("req.body--------------->", req.body);

    let timeFrom, timeTo;

    // If filterStatus is off or no dates provided, get latest 10 records
    if (filterStatus === "off" || !startDate || !endDate) {
      timeTo = Math.floor(Date.now() / 1000);
      timeFrom = timeTo - 24 * 60 * 60; // Last 24 hours for context
    } else {
      // Validate date inputs
      const startTime = new Date(startDate);
      const endTime = new Date(endDate);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error(
          "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)"
        );
      }

      if (startTime >= endTime) {
        throw new Error("startDate must be before endDate");
      }

      timeFrom = Math.floor(startTime.getTime() / 1000);
      timeTo = Math.floor(endTime.getTime() / 1000);
    }

    // Get all hosts
    const hosts = await makeZabbixRequest(authToken, "host.get", {
      output: ["hostid", "name"],
    });

    if (!hosts || hosts.length === 0) {
      return {
        error:
          "No hosts found. Please ensure your Zabbix account has access to at least one host.",
      };
    }

    // For each host, get historical data
    const results = await Promise.all(
      hosts.map(async (host) => {
        try {
          // Get CPU utilization
          const cpuItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "system.cpu.load" },
            sortfield: "name",
          });

          const cpuData =
            cpuItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [cpuItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: timeTo,
                  sortfield: "clock",
                  sortorder: "DESC",
                  limit: filterStatus === "off" ? 10 : undefined,
                })
              : [];

          // Convert CPU clock to human-readable format
          const formattedCpuData = cpuData.map((item) => ({
            ...item,
            clock: formatTimestamp(item.clock),
          }));
          const filteredCpuData =
            filterStatus === "off"
              ? formattedCpuData.slice(0, 10)
              : filterHourlyData(formattedCpuData, timeFrom, timeTo);

          // Get memory utilization
          const memoryItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vm.memory.size[pavailable]" },
          });

          const memoryData =
            memoryItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [memoryItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: timeTo,
                  sortfield: "clock",
                  sortorder: "DESC",
                  limit: filterStatus === "off" ? 10 : undefined,
                })
              : [];

          const formattedMemoryData = memoryData.map((item) => ({
            ...item,
            clock: formatTimestamp(item.clock),
          }));
          const filteredMemoryData =
            filterStatus === "off"
              ? formattedMemoryData.slice(0, 10)
              : filterHourlyData(formattedMemoryData, timeFrom, timeTo);

          // Get disk utilization
          const diskItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vfs.fs.dependent.size[/,pused]" },
          });

          const diskData =
            diskItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [diskItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: timeTo,
                  sortfield: "clock",
                  sortorder: "DESC",
                  limit: filterStatus === "off" ? 10 : undefined,
                })
              : [];

          const formattedDiskData = diskData.map((item) => ({
            ...item,
            clock: formatTimestamp(item.clock),
          }));
          const filteredDiskData =
            filterStatus === "off"
              ? formattedDiskData.slice(0, 10)
              : filterHourlyData(formattedDiskData, timeFrom, timeTo);

          return {
            hostid: host.hostid,
            hostname: host.name,
            dateRange: {
              startDate: startDate || new Date(timeFrom * 1000).toISOString(),
              endDate: endDate || new Date(timeTo * 1000).toISOString(),
              timeFrom,
              timeTo,
            },
            dataPointsPerDay: filterStatus === "off" ? 10 : 24,
            cpu: filteredCpuData,
            memory: filteredMemoryData,
            disk: filteredDiskData,
          };
        } catch (error) {
          return {
            hostid: host.hostid,
            hostname: host.name,
            error: `Failed to fetch data for host: ${error.message}`,
          };
        }
      })
    );

    return results;
  })
);

app.post(
  "/api/zabbix/all-utilizations-v3",
  apiRoute(async (authToken, req) => {
    const { startDate, endDate } = req.body;

    console.log("req.body--------------->", req.body);

    // Validate input
    if (!startDate || !endDate) {
      throw new Error("Both startDate and endDate are required");
    }

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error(
        "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)"
      );
    }

    if (startTime >= endTime) {
      throw new Error("startDate must be before endDate");
    }

    // Calculate day difference
    const timeDifferenceMs = endTime.getTime() - startTime.getTime();
    const dayDifference = Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24));

    console.log(`Date range: ${dayDifference} days`);

    // Determine sampling strategy based on day difference
    const getSamplingStrategy = (days) => {
      if (days <= 2) {
        return {
          maxRecords: 30,
          recordsPerDay: Math.floor(30 / days),
          intervalHours: Math.max(1, Math.floor(24 / Math.floor(30 / days))),
        };
      } else if (days <= 7) {
        return {
          maxRecords: 35,
          recordsPerDay: 5,
          intervalHours: Math.floor(24 / 5), // ~4.8 hours, will use 4 hours
        };
      } else if (days <= 30) {
        return {
          maxRecords: 40,
          recordsPerDay: Math.max(1, Math.floor(40 / days)),
          intervalHours: Math.max(
            1,
            Math.floor(24 / Math.max(1, Math.floor(40 / days)))
          ),
        };
      } else if (days <= 85) {
        return {
          maxRecords: 50,
          recordsPerDay: Math.max(1, Math.floor(50 / days)),
          intervalHours: Math.max(
            6,
            Math.floor(24 / Math.max(1, Math.floor(50 / days)))
          ),
        };
      } else {
        // 90-180 days
        return {
          maxRecords: 70,
          recordsPerDay: Math.max(1, Math.floor(70 / days)),
          intervalHours: Math.max(
            12,
            Math.floor(24 / Math.max(1, Math.floor(70 / days)))
          ),
        };
      }
    };

    const samplingStrategy = getSamplingStrategy(dayDifference);
    console.log(`Sampling strategy:`, samplingStrategy);

    // Function to sample data points based on strategy
    const sampleData = (data, strategy) => {
      if (!data || data.length === 0) return [];

      const totalRecords = Math.min(data.length, strategy.maxRecords);

      if (data.length <= totalRecords) {
        return data;
      }

      // Calculate step size for uniform sampling
      const step = Math.floor(data.length / totalRecords);
      const sampledData = [];

      for (let i = 0; i < data.length; i += step) {
        if (sampledData.length < totalRecords) {
          sampledData.push(data[i]);
        }
      }

      // Ensure we always include the last data point if we haven't reached max records
      if (
        sampledData.length < totalRecords &&
        sampledData[sampledData.length - 1] !== data[data.length - 1]
      ) {
        sampledData.push(data[data.length - 1]);
      }

      return sampledData.slice(0, totalRecords);
    };

    // Convert to Unix timestamps
    const timeFrom = Math.floor(startTime.getTime() / 1000);
    const timeTo = Math.floor(endTime.getTime() / 1000);

    // Get all hosts
    const hosts = await makeZabbixRequest(authToken, "host.get", {
      output: ["hostid", "name"],
    });

    if (!hosts || hosts.length === 0) {
      throw new Error("No hosts found");
    }

    const results = await Promise.all(
      hosts.map(async (host) => {
        try {
          // CPU item
          const cpuItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "system.cpu.load" },
            sortfield: "name",
          });

          let cpuData = [];
          if (cpuItems.length > 0) {
            const rawCpuData = await makeZabbixRequest(authToken, "trend.get", {
              output: "extend",
              itemids: [cpuItems[0].itemid],
              time_from: timeFrom,
              time_till: timeTo,
              sortfield: "clock",
              sortorder: "ASC", // Changed to ASC for chronological order
            });

            // Apply sampling strategy
            const sampledCpuData = sampleData(rawCpuData, samplingStrategy);
            cpuData = sampledCpuData.map((item) => ({
              ...item,
              clock: formatTimestamp(item.clock),
            }));
          }

          // Memory item
          const memoryItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vm.memory.size[pavailable]" },
          });

          let memoryData = [];
          if (memoryItems.length > 0) {
            const rawMemoryData = await makeZabbixRequest(
              authToken,
              "trend.get",
              {
                output: "extend",
                itemids: [memoryItems[0].itemid],
                time_from: timeFrom,
                time_till: timeTo,
                sortfield: "clock",
                sortorder: "ASC", // Changed to ASC for chronological order
              }
            );

            // Apply sampling strategy
            const sampledMemoryData = sampleData(
              rawMemoryData,
              samplingStrategy
            );
            memoryData = sampledMemoryData.map((item) => ({
              ...item,
              clock: formatTimestamp(item.clock),
            }));
          }

          // Disk item
          const diskItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vfs.fs.dependent.size[/,pused]" },
          });

          let diskData = [];
          if (diskItems.length > 0) {
            const rawDiskData = await makeZabbixRequest(
              authToken,
              "trend.get",
              {
                output: "extend",
                itemids: [diskItems[0].itemid],
                time_from: timeFrom,
                time_till: timeTo,
                sortfield: "clock",
                sortorder: "ASC", // Changed to ASC for chronological order
              }
            );

            // Apply sampling strategy
            const sampledDiskData = sampleData(rawDiskData, samplingStrategy);
            diskData = sampledDiskData.map((item) => ({
              ...item,
              clock: formatTimestamp(item.clock),
            }));
          }

          return {
            hostid: host.hostid,
            hostname: host.name,
            dateRange: {
              startDate: startDate,
              endDate: endDate,
              timeFrom: timeFrom,
              timeTo: timeTo,
              dayDifference: dayDifference,
              samplingStrategy: samplingStrategy,
            },
            cpu: cpuData,
            memory: memoryData,
            disk: diskData,
            metadata: {
              totalDays: dayDifference,
              maxRecords: samplingStrategy.maxRecords,
              recordsPerDay: samplingStrategy.recordsPerDay,
              intervalHours: samplingStrategy.intervalHours,
              actualRecords: {
                cpu: cpuData.length,
                memory: memoryData.length,
                disk: diskData.length,
              },
            },
          };
        } catch (error) {
          return {
            hostid: host.hostid,
            hostname: host.name,
            error: `Failed to fetch data for host: ${error.message}`,
            dateRange: {
              startDate: startDate,
              endDate: endDate,
              dayDifference: dayDifference,
            },
          };
        }
      })
    );

    return results;
  })
);

app.post(
  "/api/zabbix/all-utilizations-v13",
  apiRoute(async (authToken, req) => {
    const { startDate, endDate } = req.body;

    console.log("req.body--------------->", req.body);

    // Validate input
    if (!startDate || !endDate) {
      throw new Error("Both startDate and endDate are required");
    }

    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error(
        "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)"
      );
    }

    if (startTime >= endTime) {
      throw new Error("startDate must be before endDate");
    }

    // Convert to Unix timestamps
    const timeFrom = Math.floor(startTime.getTime() / 1000);
    const timeTo = Math.floor(endTime.getTime() / 1000);

    // Get all hosts
    const hosts = await makeZabbixRequest(authToken, "host.get", {
      output: ["hostid", "name"],
    });

    if (!hosts || hosts.length === 0) {
      throw new Error("No hosts found");
    }

    const results = await Promise.all(
      hosts.map(async (host) => {
        try {
          // CPU item
          const cpuItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "system.cpu.load" },
            sortfield: "name",
          });

          const cpuData =
            cpuItems.length > 0
              ? await makeZabbixRequest(authToken, "trend.get", {
                  output: "extend",
                  itemids: [cpuItems[0].itemid],
                  time_from: timeFrom,
                  time_till: timeTo,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          const formattedCpuData = cpuData.map((item) => ({
            ...item,
            clock: formatTimestamp(item.clock),
          }));

          // Memory item
          const memoryItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vm.memory.size[pavailable]" },
          });

          const memoryData =
            memoryItems.length > 0
              ? await makeZabbixRequest(authToken, "trend.get", {
                  output: "extend",
                  itemids: [memoryItems[0].itemid],
                  time_from: timeFrom,
                  time_till: timeTo,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          const formattedMemoryData = memoryData.map((item) => ({
            ...item,
            clock: formatTimestamp(item.clock),
          }));

          // Disk item
          const diskItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vfs.fs.dependent.size[/,pused]" },
          });

          const diskData =
            diskItems.length > 0
              ? await makeZabbixRequest(authToken, "trend.get", {
                  output: "extend",
                  itemids: [diskItems[0].itemid],
                  time_from: timeFrom,
                  time_till: timeTo,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          const formattedDiskData = diskData.map((item) => ({
            ...item,
            clock: formatTimestamp(item.clock),
          }));

          return {
            hostid: host.hostid,
            hostname: host.name,
            dateRange: {
              startDate: startDate,
              endDate: endDate,
              timeFrom: timeFrom,
              timeTo: timeTo,
            },
            cpu: formattedCpuData,
            memory: formattedMemoryData,
            disk: formattedDiskData,
          };
        } catch (error) {
          return {
            hostid: host.hostid,
            hostname: host.name,
            error: `Failed to fetch data for host: ${error.message}`,
          };
        }
      })
    );

    return results;
  })
);

// API endpoint to get latest single record for all hosts
app.post(
  "/api/zabbix/latest-utilizations-v2",
  apiRoute(async (authToken, req) => {
    // Step 1: Get all hosts
    const hosts = await makeZabbixRequest(authToken, "host.get", {
      output: ["hostid", "name"],
    });

    if (!hosts || hosts.length === 0) {
      throw new Error("No hosts found");
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeFrom = currentTime - 60; // Last 1 minute to get latest record

    // Step 2: For each host, get latest record for CPU, memory, and disk utilization
    const results = await Promise.all(
      hosts.map(async (host) => {
        try {
          // Get CPU utilization
          const cpuItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "system.cpu.load" },
            sortfield: "name",
          });

          const cpuData =
            cpuItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [cpuItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: currentTime,
                  limit: 1,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          // Get memory utilization
          const memoryItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vm.memory.size[pavailable]" },
          });

          const memoryData =
            memoryItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [memoryItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: currentTime,
                  limit: 1,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          // Get disk utilization
          const diskItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vfs.fs.dependent.size[/,pused]" },
          });

          const diskData =
            diskItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [diskItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: currentTime,
                  limit: 1,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          return {
            hostid: host.hostid,
            hostname: host.name,
            cpu: cpuData,
            memory: memoryData,
            disk: diskData,
          };
        } catch (error) {
          return {
            hostid: host.hostid,
            hostname: host.name,
            error: `Failed to fetch latest data for host: ${error.message}`,
          };
        }
      })
    );

    return results;
  })
);

//Latest utilizations endpoint (as provided)
app.post(
  "/api/zabbix/latest-utilizations",
  apiRoute(async (authToken, req) => {
    const hosts = await makeZabbixRequest(authToken, "host.get", {
      output: ["hostid", "name"],
    });

    if (!hosts || hosts.length === 0) {
      return {
        error:
          "No hosts found. Please ensure your Zabbix account has access to at least one host.",
      };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeFrom = currentTime - 60; // Last 1 minute to get latest record

    const results = await Promise.all(
      hosts.map(async (host) => {
        try {
          const cpuItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "system.cpu.load" },
            sortfield: "name",
          });

          const cpuData =
            cpuItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [cpuItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: currentTime,
                  limit: 1,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          const memoryItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vm.memory.size[pavailable]" },
          });

          const memoryData =
            memoryItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [memoryItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: currentTime,
                  limit: 1,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          const diskItems = await makeZabbixRequest(authToken, "item.get", {
            output: ["itemid", "name", "lastvalue"],
            hostids: host.hostid,
            search: { key_: "vfs.fs.dependent.size[/,pused]" },
          });

          const diskData =
            diskItems.length > 0
              ? await makeZabbixRequest(authToken, "history.get", {
                  output: "extend",
                  itemids: [diskItems[0].itemid],
                  history: 0,
                  time_from: timeFrom,
                  time_till: currentTime,
                  limit: 1,
                  sortfield: "clock",
                  sortorder: "DESC",
                })
              : [];

          return {
            hostid: host.hostid,
            hostname: host.name,
            cpu: cpuData.map((item) => ({
              ...item,
              clock: formatTimestamp(item.clock),
            })),
            memory: memoryData.map((item) => ({
              ...item,
              clock: formatTimestamp(item.clock),
            })),
            disk: diskData.map((item) => ({
              ...item,
              clock: formatTimestamp(item.clock),
            })),
          };
        } catch (error) {
          return {
            hostid: host.hostid,
            hostname: host.name,
            error: `Failed to fetch latest data for host: ${error.message}`,
          };
        }
      })
    );

    return results;
  })
);

// Create HOST Group API
app.post(
  "/api/zabbix/hostgroup-create",
  apiRoute(async (authToken, req) => {
    const { name } = req.body;

    if (!name) {
      throw new Error("Host group name is required");
    }

    const response = await makeZabbixRequest(authToken, "hostgroup.create", {
      name,
    });

    console.log("response------------->",response)
    return response;
  })
);

// GET /api/zabbix/hostgroup-list
app.get(
  "/api/zabbix/hostgroup-list",
  apiRoute(async (authToken, req) => {
    const response = await makeZabbixRequest(authToken, "hostgroup.get", {
      output: ["groupid", "name"],
      sortfield: "name",
    });

    return response;
  })
);

// Create Host API
app.post(
  "/api/zabbix/host-create",
  apiRoute(async (authToken, req) => {
    const { hostName, ip, groupid, templateid } = req.body;

    if (!hostName || !ip || !groupid || !templateid) {
      throw new Error(
        "Missing required fields: hostName, ip, groupid, templateid"
      );
    }

    // Prepare the payload for host.create
    const newHostPayload = {
      host: hostName,
      interfaces: [
        {
          type: 1, // Agent
          main: 1,
          useip: 1,
          ip: ip,
          dns: "",
          port: "10050",
        },
      ],
      groups: [
        {
          groupid: groupid,
        },
      ],
      templates: [
        {
          templateid: templateid,
        },
      ],
      inventory_mode: 0, // Manual inventory
    };

    const response = await makeZabbixRequest(
      authToken,
      "host.create",
      newHostPayload
    );
    return response;
  })
);

// POST /api/zabbix/template-create
app.post(
  "/api/zabbix/template-create",
  apiRoute(async (authToken, req) => {
    const { templateName, groupid } = req.body;

    if (!templateName || !groupid) {
      throw new Error("templateName and groupid are required");
    }

    const result = await makeZabbixRequest(authToken, "template.create", {
      host: templateName, // Template name
      groups: [{ groupid: groupid }],
    });

    return result;
  })
);

// GET /api/zabbix/template-list
app.get(
  "/api/zabbix/template-list",
  apiRoute(async (authToken, req) => {
    const result = await makeZabbixRequest(authToken, "template.get", {
      output: ["templateid", "name", "host"],
      sortfield: "name"
    });

    return result;
  })
);




// Server startup
app.listen(PORT, () => {
  console.info(`Server running on http://localhost:${PORT}`);
});
