/**
 * SafeRaasta SOS Controller
 * Triggers Retell AI emergency call
 */

import fetch from "node-fetch";

export async function triggerSOS(req, res) {
  try {
    const { userName, latitude, longitude, timestamp, contacts } = req.body;

    if (!userName || !latitude || !longitude || !timestamp) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ success: false, error: "No emergency contacts provided" });
    }

    const firstContact = contacts[0];
    if (!firstContact.phone || !firstContact.name) {
      return res.status(400).json({ success: false, error: "Invalid contact data" });
    }

    // Format location as address
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    // Format timestamp to readable format (e.g., "2:30 PM")
    const dateObj = new Date(timestamp);
    const timeStr = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const retellApiKey = process.env.RETELL_API_KEY;
    const retellAgentId = process.env.RETELL_AGENT_ID;
    const retellFromNumber = process.env.RETELL_FROM_NUMBER;

    if (!retellApiKey || !retellAgentId) {
      return res.status(500).json({ success: false, error: "Missing Retell credentials" });
    }

    if (!retellFromNumber) {
      return res.status(500).json({ success: false, error: "Missing Retell from_number" });
    }

    const retellResponse = await fetch("https://api.retellai.com/v2/create-phone-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${retellApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agent_id: retellAgentId,
        to_number: firstContact.phone,
        from_number: retellFromNumber,
        // Pass variables that Retell agent can use in the script
        override_agent_config: {
          general_prompt_override: `You are responding to an emergency alert for {name} at {address} at {time}.`
        },
        // Send metadata with the actual values for the script
        metadata: {
          name: userName,
          address: address,
          time: timeStr,
          mapsLink: mapsLink,
          timestamp: timestamp,
          contactName: firstContact.name,
          latitude: latitude,
          longitude: longitude
        }
      })
    });

    const retellData = await retellResponse.json();

    if (!retellResponse.ok) {
      console.error("Retell call failed", {
        status: retellResponse.status,
        statusText: retellResponse.statusText,
        body: retellData,
      });
      return res.status(500).json({
        success: false,
        error: retellData?.error || retellData?.message || "Failed to trigger emergency call",
        details: retellData,
      });
    }

    console.log("SOS call initiated successfully", {
      callId: retellData.call_id,
      toNumber: firstContact.phone,
      userName: userName,
      address: address,
      time: timeStr
    });

    return res.status(200).json({
      success: true,
      message: "SOS triggered successfully",
      called: firstContact.phone,
      callId: retellData.call_id,
      emergencyDetails: {
        userName,
        address,
        time: timeStr,
        mapsLink
      }
    });

  } catch (error) {
    console.error("Unhandled SOS error", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
}